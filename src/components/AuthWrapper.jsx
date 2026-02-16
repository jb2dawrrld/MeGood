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
      loginMechanisms={['email']} 
      signUpAttributes={['name', 'preferred_username']}
      formFields={{
        signUp: {
          name: {
            label: 'Full Name',
            required: true,
            order: 1,
          },
          preferred_username: {
            label: 'Display Name',
            required: true,
            order: 2,
          },
          email: {
            label: 'Email',
            required: true,
            order: 3,
          },
          password: {
            order: 4,
          },
          confirm_password: {
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