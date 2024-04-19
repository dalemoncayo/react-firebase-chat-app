import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './configs/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth'

import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ChatRoomList from './components/ChatRoomList';
import ChatRoom from './components/ChatRoom';
import Error404 from './components/Error404';

function App() {
  // State variables to store user information and loading status
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // useEffect hook to listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, user => {
      console.log('onAuthStateChanged', user);
      setUser(user);
      setLoading(false);
    });
    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  const onSignOut = async () => {
    // Function to handle user sign out
    await signOut(auth);
  }

  return (
    <div>
      {
        loading ? <div>Loading...</div> : <>
          {/* Render sign out button if user is logged in */}
          {user ? <button onClick={onSignOut} className='sign-out'>Sign out</button> : null}
          <Router>
            <Routes>
              {/* Route for sign up page */}
              <Route path="/sign-up" element={user ? <Navigate to="/" /> : <SignUp />} />
              {/* Route for sign in page */}
              <Route path="/sign-in" element={user ? <Navigate to="/" /> : <SignIn />} />
              {/* Route for chat room list page */}
              <Route path="/" element={user ? <ChatRoomList /> : <Navigate to="/sign-in" />} />
              {/* Route for individual chat room page */}
              <Route path="/chat/:chatRoomId" element={user ? <ChatRoom user={user} /> : <Navigate to="/sign-in" />} />
              {/* Route for 404 error page */}
              <Route path="*" element={<Error404 />} />
            </Routes>
          </Router>
        </>
      }
    </div>
  )
}

export default App;
