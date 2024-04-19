import { useState } from 'react';
import { auth, googleProvider } from '../configs/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

function SignIn() {
  // State variables to store error message, email, and password
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle sign in with email and password
  const signInWithEmail = async () => {
    try {
      setErrorMessage('');

      // Check if email or password is empty
      if (email.trim() === '' || password.trim() === '') {
        setErrorMessage('Email and password are required.');
        return;
      }

      // Sign in with email and password using Firebase auth
      await signInWithEmailAndPassword(auth, email, password);

      // Clear email and password fields after successful sign in
      setEmail('');
      setPassword('');
    } catch (error) {
      // Handle specific error codes
      if (error.code === 'auth/invalid-credential') {
        setErrorMessage('Incorrect password. Please try again.');
      } else {
        setErrorMessage('Failed to sign in.');
      }
    }
  };

  // Function to handle sign in with Google
  const signInWithGoogle = async () => {
    try {
      // Sign in with Google using Firebase auth
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      // Handle specific error codes
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Cannot create an account with this email. Please sign in.');
      } else {
        setErrorMessage('Failed to sign up.');
      }
    }
  }

  return (
    <div className='form'>
      <h1>Sign In</h1>
      <div className='error'>{errorMessage}</div>
      <input
        type='email'
        placeholder='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signInWithEmail}>Sign In</button>
      <button onClick={signInWithGoogle}>Sign In with Google</button>
    </div>
  );
}

export default SignIn;
