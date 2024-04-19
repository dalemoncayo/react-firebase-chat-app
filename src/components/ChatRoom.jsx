import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, storage } from '../configs/firebase';
import { collection, doc, getDoc, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function ChatRoom({ user }) {
  const { chatRoomId } = useParams();

  const [title, setTitle] = useState('');
  const [list, setList] = useState([]);
  const [message, setMessage] = useState('');

  const listCollection = collection(db, 'chat_message');

  useEffect(() => {
    // Fetch the list of messages and the chat room title
    getList();
    getDocument(chatRoomId);
  }, []);

  // Function to fetch the list of messages
  const getList = async () => {
    try {
      // Subscribe to real-time updates of the chat messages
      const unsubscribe = onSnapshot(
        query(
          listCollection,
          where('chatRoomId', '==', chatRoomId),
          orderBy('timestamp')
        ),
        (snapshot) => {
          // Map the document data to an array of objects with id
          const updatedList = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
          setList(updatedList);
        }
      );
      return () => unsubscribe(); // Unsubscribe from real-time updates when component unmounts
    } catch (error) {
      console.error(error);
    }
  };

  // Function to fetch the chat room document
  const getDocument = async (documentId) => {
    try {
      const docRef = doc(db, 'chat_room', documentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const documentData = { ...docSnap.data(), id: docSnap.id };
        setTitle(documentData.title);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Function to send a message
  const send = async () => {
    try {
      if (message.trim() === '') {
        return;
      }

      // Add a new message to the chat room
      await addDoc(listCollection, {
        message,
        senderName: user.displayName ?? user.email,
        senderId: user.uid,
        chatRoomId: chatRoomId,
        timestamp: serverTimestamp()
      });

      setMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  // Function to upload a file
  const fileUpload = async (file) => {
    if (!file) {
      return;
    }

    const storageRef = ref(storage, `chat/${chatRoomId}/${Date.parse(new Date())}_${file.name}`);
    const result = await uploadBytes(storageRef, file);
    console.log('result ', result);
    const downloadURL = await getDownloadURL(storageRef);
    console.log('downloadURL', downloadURL);

    // Add a new message with the uploaded image to the chat room
    await addDoc(listCollection, {
      message,
      senderName: user.displayName ?? user.email,
      senderId: user.uid,
      chatRoomId: chatRoomId,
      image: downloadURL,
      timestamp: serverTimestamp()
    });
  };

  return (
    <>
      <Link to='/'>Back</Link>
      <h1>{title}</h1>
      {list.map((item, index) => (
        item.timestamp ? (
          <div style={{ marginBottom: 15 }} key={index}>
            <b>
              {item.senderName}:<br /> {item.image ? <img src={item.image} alt='image' style={{ width: 200 }} /> : item.message}
            </b>
            <br />
            <span>{item.timestamp?.toDate().toLocaleString()}</span>
          </div>
        ) : null
      ))}
      <input
        type='text'
        placeholder='Message'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={send}>Send</button>
      <input type='file' onChange={(e) => fileUpload(e.target.files[0])} />
    </>
  );
}

export default ChatRoom;
