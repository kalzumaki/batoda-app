import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {get, put} from '../../utils/proxy';
import BackButton from '../../components/BackButton';

const EditTricycleNumberScreen: React.FC = () => {
  const [tricycleDigits, setTricycleDigits] = useState(['', '', '']);
  const [fetchedNumber, setFetchedNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const fetchTricycleNumber = async () => {
      try {
        const response = await get(API_ENDPOINTS.FETCH_TRICYCLE_NUMBER);
        if (response.status) {
          const fetchedNumber = response.tricycle_number;
          setFetchedNumber(fetchedNumber);
          setTricycleDigits(fetchedNumber.split(''));
        } else {
          Alert.alert('Error', 'Failed to fetch tricycle number.');
        }
      } catch (error) {
        console.log('❌ Error fetching tricycle number:', error);
        Alert.alert(
          'Error',
          'An error occurred while fetching the tricycle number.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTricycleNumber();
  }, []);

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

  const handleUpdate = async () => {
    const tricycleNumber = tricycleDigits.join('');
    if (tricycleNumber.length !== 3) {
      Alert.alert('Error', 'Tricycle number must be 3 digits.');
      return;
    }

    if (tricycleNumber === fetchedNumber) {
      Alert.alert(
        'Info',
        'New tricycle number is the same as the current one. No changes made.',
      );
      return;
    }

    try {
      setIsLoading(true);
      const response = await put(
        API_ENDPOINTS.UPDATE_TRICYCLE_NUMBER,
        {tricycle_number: tricycleNumber},
        true,
      );
      if (response.status) {
        Alert.alert('Success', 'Tricycle number updated successfully.');
      } else {
        Alert.alert('Error', 'Failed to update tricycle number.');
      }
    } catch (error) {
      console.log('❌ Error updating tricycle number:', error);
      Alert.alert(
        'Error',
        'An error occurred while updating the tricycle number.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#469c8f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Edit Tricycle Number</Text>
      <Text style={styles.guidance}>
        Please enter a valid 3-digit tricycle number.
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
          />
        ))}
      </View>
      <TouchableOpacity
        style={[styles.verifyButton, isLoading && {backgroundColor: '#ccc'}]}
        disabled={isLoading}
        onPress={handleUpdate}>
        <Text style={styles.verifyText}>Update Tricycle Number</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
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
  guidance: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default EditTricycleNumberScreen;
