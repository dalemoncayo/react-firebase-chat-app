import { useState } from 'react';
import { auth } from '../configs/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

function SignUp() {
  // State variables to store error message, email, and password
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle sign up with email and password
  const signUpWithEmail = async () => {
    try {
      // Check if email or password is empty
      if (email.trim() === '' || password.trim() === '') {
        setErrorMessage('Email and password are required.');
        return;
      }

      // Create user with email and password using Firebase authentication
      await createUserWithEmailAndPassword(auth, email, password);

      // Clear email and password fields after successful sign up
      setEmail('');
      setPassword('');
    } catch (error) {
      // Handle specific error cases
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Cannot create an account with this email. Please sign in.');
      } else {
        setErrorMessage('Failed to sign up.');
      }
    }
  };

  return (
    <div className='form'>
      <h1>Sign Up</h1>
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
      <button onClick={signUpWithEmail}>Sign Up</button>
    </div>
  );
}

export default SignUp;
