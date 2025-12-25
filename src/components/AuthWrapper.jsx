import { useEffect, useState } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchUserAttributes } from 'aws-amplify/auth';
import Dashboard from './Dashboard';

function AuthenticatedApp({ onSignOut }) {
  const { user, signOut } = useAuthenticator();
  const [userName, setUserName] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    async function loadUserData() {
      try {
        const attributes = await fetchUserAttributes();
        // Use preferred_username for display name
        setUserName(attributes.preferred_username || attributes.name || 'User');
        // Use name attribute for full name
        setUserFullName(attributes.name || attributes.preferred_username || 'User');
        setUserEmail(attributes.email || '');
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
    
    if (user) {
      loadUserData();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      const signOutFn = onSignOut || signOut;
      if (typeof signOutFn === 'function') {
        await signOutFn();
      } else {
        console.error('No signOut function available');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Dashboard 
      userName={userName}
      userFullName={userFullName}
      userEmail={userEmail}
      userId={user?.username}
      onSignOut={handleSignOut}
    />
  );
}

export default function AuthWrapper() {
  return (
    <Authenticator
      signUpAttributes={['preferred_username', 'name']}
      formFields={{
        signUp: {
          preferred_username: {
            label: 'User Name',
            placeholder: 'Enter your display name',
            required: true,
            order: 2,
          },
          name: {
            label: 'Full Name',
            placeholder: 'Enter your full name',
            required: false,
            order: 1,
          },

          email: {
            label: 'Email',
            required: true,
            order: 3,
          },
          password: {
            label: 'Password',
            required: true,
            order: 4,
          },
          confirm_password: {
            label: 'Confirm Password',
            required: true,
            order: 5,
          },
        },
      }}
    >
      {({ signOut, user }) => (
        user ? <AuthenticatedApp onSignOut={signOut} /> : null
      )}
    </Authenticator>
  );
}