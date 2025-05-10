import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {RootStackParamList} from '../../types/passenger-dashboard';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {post} from '../../utils/proxy';
import SuccessAlertModal from '../../components/SuccessAlertModal';
import ErrorAlertModal from '../../components/ErrorAlertModal';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const AddTricycleNumberScreen: React.FC = () => {
  const [tricycleDigits, setTricycleDigits] = useState(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const navigation = useNavigation<NavigationProps>();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [responseErrorMessage, setResponseErrorMessage] = useState('');
  const [responseSuccessMessage, setResponseSuccessMessage] = useState('');
  const [title, setTitle] = useState('');
  const handleInputChange = (text: string, index: number) => {
    if (/^\d?$/.test(text)) {
      const updatedDigits = [...tricycleDigits];
      updatedDigits[index] = text;
      setTricycleDigits(updatedDigits);

      // Move to the next input box if current is filled
      if (text !== '' && index < 2) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const getTricycleNumber = () => tricycleDigits.join('');

  const handleAddTricycleNumber = async () => {
    const tricycleNumber = getTricycleNumber();

    if (tricycleNumber.length !== 3) {
      setResponseErrorMessage('Please enter a valid 3-digit tricycle number.');
      setTitle('Invalid Tricycle Number');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await post(
        API_ENDPOINTS.ADD_TRICYCLE_NUMBER,
        {tricycle_number: tricycleNumber},
        true,
      );

      if (response.status) {
        setResponseSuccessMessage('Tricycle number added successfully!');
        setTitle('Success');
        setShowSuccessModal(true);
      } else {
        setResponseErrorMessage(response.error || response.message);
        setTitle('Error');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.log('❌ Error adding tricycle number:', error);

      if (error.response && error.response.data) {
        const {message, error: apiError} = error.response.data;
        setResponseErrorMessage(apiError || message);
        setTitle('Error');
        setShowErrorModal(true);
      } else {
        setResponseErrorMessage(
          'The Tricycle Number is already taken. Please try another one.',
        );
        setTitle('Already Exist');
        setShowErrorModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Tricycle Number</Text>
      <Text style={styles.description}>
        Please enter your unique 3-digit tricycle number. This will be used to
        identify your vehicle in the system.
      </Text>
      <Text style={styles.note}>
        Note: Ensure the tricycle number is correct. Duplicate numbers are not
        allowed.
      </Text>

      <View style={styles.otpContainer}>
        {tricycleDigits.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
            value={digit}
            onChangeText={text => handleInputChange(text, index)}
            maxLength={1}
            keyboardType="numeric"
            textAlign="center"
            autoFocus={index === 0}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, isLoading && {backgroundColor: '#ccc'}]}
        onPress={handleAddTricycleNumber}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.verifyText}>Add Tricycle Number</Text>
        )}
      </TouchableOpacity>
      <SuccessAlertModal
        visible={showSuccessModal}
        title={title}
        message={responseSuccessMessage}
        onDismiss={() => navigation.replace('DriverDashboard')}
      />
      <ErrorAlertModal
        visible={showErrorModal}
        title={title}
        message={responseErrorMessage}
        onDismiss={() => setShowErrorModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#469c8f',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#469c8f',
    textAlign: 'center',
    marginBottom: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  note: {
    color: 'red',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 10,
    textAlign: 'center',
  },

  otpInput: {
    width: 40,
    height: 50,
    borderColor: '#469c8f',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 20,
    marginHorizontal: 5,
    backgroundColor: 'white',
    color: 'black',
  },
  verifyButton: {
    backgroundColor: '#469c8f',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  verifyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddTricycleNumberScreen;
