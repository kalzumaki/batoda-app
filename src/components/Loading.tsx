import React, { useEffect } from 'react';
import Toast from 'react-native-toast-message';

type OptimisticFeedbackProps = {
  action: 'login' | 'logout'; // Define the type of action
};

const OptimisticFeedback: React.FC<OptimisticFeedbackProps> = ({ action }) => {
  // Show optimistic feedback for login or logout
  const message = action === 'login' ? 'Logging in...' : 'Logging out...';

  useEffect(() => {
    // Show toast when the component is mounted
    Toast.show({
      type: 'info',
      text1: message,
    });
  }, [action]); // Effect will run when `action` changes

  return null; // This component doesn't render any UI
};

export default OptimisticFeedback;
