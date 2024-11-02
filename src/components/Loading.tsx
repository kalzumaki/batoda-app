import React, {useEffect} from 'react';
import Toast from 'react-native-toast-message';

type OptimisticFeedbackProps = {
  action: 'login' | 'logout';
};

const OptimisticFeedback: React.FC<OptimisticFeedbackProps> = ({action}) => {
  const message = action === 'login' ? 'Logging in...' : 'Logging out...';

  useEffect(() => {
    Toast.show({
      type: 'info',
      text1: message,
    });
  }, [action]);

  return null;
};

export default OptimisticFeedback;
