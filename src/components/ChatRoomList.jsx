import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { db } from '../configs/firebase'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'

function ChatRoomList() {
  const [list, setList] = useState([]) // State to store the chat room list
  const [title, setTitle] = useState('') // State to store the input field value

  const listCollection = collection(db, 'chat_room') // Reference to the 'chat_room' collection in Firestore

  useEffect(() => {
    getList() // Fetch the chat room list on component mount
  }, [])

  const getList = async () => {
    try {
      // Subscribe to real-time updates on the chat room collection, ordered by timestamp in descending order
      const unsubscribe = onSnapshot(query(listCollection, orderBy('timestamp', 'desc')), (snapshot) => {
        // Map the document data and add an 'id' property to each document
        const updatedList = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        setList(updatedList) // Update the chat room list state with the updated data
      })
      return () => unsubscribe() // Unsubscribe from real-time updates when the component unmounts
    } catch (error) {
      console.error(error)
    }
  }

  const save = async () => {
    try {
      if (title.trim() === '') {
        return // If the title is empty or contains only whitespace, do not save
      }

      // Add a new document to the chat room collection with the provided title and server timestamp
      await addDoc(listCollection, {
        title,
        timestamp: serverTimestamp()
      })

      setTitle('') // Clear the input field after saving
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <h1>Chat Room List</h1>
      <input
        type='text'
        placeholder='Title'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={save}>Save</button>
      {
        list.map((item, index) => (
          item.timestamp ? <div key={index}>
            <Link to={`/chat/${item.id}`}>
              <h3>{item.title}</h3>
            </Link>
            <p>{item.timestamp?.toDate().toLocaleString()}</p>
          </div> : null
        ))
      }
    </>
  )
}

export default ChatRoomList;
