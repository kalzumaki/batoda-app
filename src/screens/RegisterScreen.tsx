import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import InputComponent from '../components/Input';
import PasswordInput from '../components/PasswordInput';
import {postFormData} from '../utils/proxy'; // Import the FormData posting function
import {API_ENDPOINTS} from '../api/api-endpoints';
import Toast from 'react-native-toast-message';
import OptimisticFeedback from '../components/Loading';
import DatePickerComponent from '../components/DatePicker';
import DropdownComponent from '../components/Dropdown';
import {RootStackParamList} from '../types/passenger-dashboard';
import Stepper from 'react-native-stepper-view'; // Correct Stepper import
import {Picker} from '@react-native-picker/picker'; // Import Picker for selecting document type

// Import types from types/register.ts
import {RegisterFormData, FormImage} from '../types/register';
import {launchImageLibrary} from 'react-native-image-picker';
import BackButton from '../components/BackButton';
import SuccessAlertModal from '../components/SuccessAlertModal';
import ErrorAlertModal from '../components/ErrorAlertModal';

// Define the navigation types
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Register: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [responseErrorMessage, setResponseErrorMessage] = useState('');

  const [title, setTitle] = useState('');
  const [formData, setFormData] = useState<RegisterFormData>({
    fname: '',
    lname: '',
    email: '',
    password: '',
    password_confirmation: '',
    mobile_number: '',
    address: '',
    birthday: '',
    gender: 'male',
    user_type_id: 8, // Default to passenger (8)
    brgy_clearance: null,
    valid_id_front: null,
    valid_id_back: null,
    valid_id_type: '',
    id_number: '',
  });

  const [isRegistering, setIsRegistering] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // To track current step
  const stepperRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    key: keyof RegisterFormData,
    value: string | number | FormImage | null,
  ) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const handleFileChange = (
    key: keyof RegisterFormData,
    file: FormImage | null,
  ) => {
    setFormData(prev => ({...prev, [key]: file}));
  };

  const handleImagePick = async (
    fileType: 'brgy_clearance' | 'valid_id_front' | 'valid_id_back',
  ) => {
    try {
      const pickerResult = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 1,
      });

      if (pickerResult.didCancel) {
        console.log('User canceled image picker');
        return;
      }

      if (pickerResult.errorMessage) {
        console.error('ImagePicker Error: ', pickerResult.errorMessage);
        return;
      }

      const {uri, fileName, type} = pickerResult.assets?.[0] || {};
      if (uri && fileName && type) {
        const file = {uri, name: fileName, type};

        // Update the state with the selected file
        handleFileChange(fileType, file);
      } else {
        console.error('Incomplete file data: ', {uri, fileName, type});
      }
    } catch (error) {
      console.error('Error picking image: ', error);
    }
  };

  const handleRegister = async () => {
    if (formData.password !== formData.password_confirmation) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match. Please try again.',
      });
      return;
    }

    if (
      (formData.user_type_id === 6 || formData.user_type_id === 7) &&
      (!formData.brgy_clearance ||
        !formData.valid_id_front ||
        !formData.valid_id_back)
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Documents',
        text2:
          'Please upload Barangay Clearance and both Valid ID Front and Back.',
      });
      return;
    }

    setIsRegistering(true);
    setLoading(true);
    try {
      // Prepare FormData for API submission
      const form = new FormData();

      // Add form fields to FormData
      form.append('fname', formData.fname);
      form.append('lname', formData.lname);
      form.append('email', formData.email);
      form.append('password', formData.password);
      form.append('password_confirmation', formData.password_confirmation);
      form.append('mobile_number', formData.mobile_number);
      form.append('address', formData.address);
      form.append('birthday', formData.birthday);
      form.append('gender', formData.gender);
      form.append('user_type_id', formData.user_type_id.toString());
      form.append('valid_id_type', String(formData.valid_id_type));
      form.append('id_number', formData.id_number);

      // Add files to FormData if available
      if (formData.brgy_clearance) {
        form.append('brgy_clearance', {
          uri: formData.brgy_clearance.uri,
          name: formData.brgy_clearance.name,
          type: formData.brgy_clearance.type,
        });
      }
      if (formData.valid_id_front) {
        form.append('valid_id_front', {
          uri: formData.valid_id_front.uri,
          name: formData.valid_id_front.name,
          type: formData.valid_id_front.type,
        });
      }
      if (formData.valid_id_back) {
        form.append('valid_id_back', {
          uri: formData.valid_id_back.uri,
          name: formData.valid_id_back.name,
          type: formData.valid_id_back.type,
        });
      }

      // Submit the form data using postFormData
      const data = await postFormData(API_ENDPOINTS.REGISTER, form, false);
      console.log('New User Registered:', data);

      if (!data || data.status === false) {
        let errorMessage = data.message || 'Registration failed.';

        if (data.errors) {
          if (data.errors.password) {
            errorMessage = data.errors.password[0];
          } else {
            const firstErrorField = Object.keys(data.errors)[0];
            errorMessage = data.errors[firstErrorField][0];
          }
        }

        setTitle('Registration Failed')
        setResponseErrorMessage(errorMessage)
        setShowErrorModal(true)
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Check Email for Verification!',
        text2: 'Registration Successful',
      });

      navigation.navigate('Login');
    } catch (error: any) {
      console.log(
        'API request error:',
        error?.response?.data || error?.message,
      );

      // Laravel-style validation error handler
      const errors = error?.response?.data?.errors;
      if (errors) {
        const firstFieldWithError = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstFieldWithError][0];

        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: firstErrorMessage,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: error?.message || 'An error occurred',
        });
      }
    } finally {
      setIsRegistering(false);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />

        {/* Using Stepper component correctly */}
        <Stepper
          ref={stepperRef}
          numberOfSteps={3}
          activeStep={currentStep} // Track active step
          onPrevStep={handlePrev} // Handle previous step
          onNextStep={handleNext} // Handle next step
          showButtons={false} // Hide default buttons
        >
          {/* Step 1: Personal Information */}
          <Stepper.Step
            label="Personal Info"
            labelColor="#ffffff"
            activeLabelColor="#ffffff"
            completedLabelColor="#ffffff"
            labelFontSize={12}
            labelFontWeight="bold"
            stepNumFontSize={20}
            stepNumFontWeight="bold"
            activeStepNumColor="#ffffff"
            disabledStepNumColor="#ffffff"
            completedCheckColor="#ffffff">
            <View style={styles.centerStepContent}>
              <InputComponent
                placeholder="First Name"
                value={formData.fname}
                onChangeText={text => handleChange('fname', text)}
              />
              <InputComponent
                placeholder="Last Name"
                value={formData.lname}
                onChangeText={text => handleChange('lname', text)}
              />
              <InputComponent
                placeholder="Mobile Number"
                value={formData.mobile_number}
                keyboardType="numeric"
                maxLength={11}
                onChangeText={text =>
                  handleChange('mobile_number', text.replace(/[^0-9]/g, ''))
                }
              />
              <InputComponent
                placeholder="Address"
                value={formData.address}
                onChangeText={text => handleChange('address', text)}
              />
              <DatePickerComponent
                value={formData.birthday}
                onChange={date => handleChange('birthday', date)}
              />
            </View>
          </Stepper.Step>

          {/* Step 2: Account Info */}
          <Stepper.Step
            label="Account Info"
            labelColor="#ffffff"
            activeLabelColor="#ffffff"
            completedLabelColor="#ffffff"
            labelFontSize={12}
            labelFontWeight="bold"
            stepNumFontSize={20}
            stepNumFontWeight="bold"
            activeStepNumColor="#ffffff"
            disabledStepNumColor="#ffffff"
            completedCheckColor="#ffffff">
            <View style={styles.centerStepContent}>
              <InputComponent
                placeholder="Email"
                value={formData.email}
                onChangeText={text => handleChange('email', text)}
              />
              <PasswordInput
                placeholder="Password"
                value={formData.password}
                onChangeText={text => handleChange('password', text)}
              />
              <PasswordInput
                placeholder="Confirm Password"
                value={formData.password_confirmation}
                onChangeText={text =>
                  handleChange('password_confirmation', text)
                }
              />
              <Text style={styles.passwordNote}>
                * Password must be at least 8 characters, and include a mix of
                letters, numbers, and symbols.
              </Text>
            </View>
          </Stepper.Step>

          {/* Step 3: File Uploads */}
          <Stepper.Step
            label="File Uploads"
            labelColor="#ffffff"
            activeLabelColor="#ffffff"
            completedLabelColor="#ffffff"
            labelFontSize={12}
            labelFontWeight="bold"
            stepNumFontSize={20}
            stepNumFontWeight="bold"
            activeStepNumColor="#ffffff"
            disabledStepNumColor="#ffffff"
            completedCheckColor="#ffffff">
            <View style={styles.stepContainer}>
              {/* User Type Dropdown */}
              <DropdownComponent
                label="Select User Type"
                selectedValue={formData.user_type_id}
                onValueChange={itemValue =>
                  handleChange('user_type_id', itemValue)
                }
                options={[
                  {label: 'Passenger', value: 8},
                  {label: 'Driver', value: 6},
                  {label: 'Dispatcher', value: 7},
                ]}
              />

              {/* ID and Barangay Clearance Uploads (Only for Driver or Dispatcher) */}
              {(formData.user_type_id === 6 || formData.user_type_id === 7) && (
                <>
                  <Text style={styles.uploadLabel}>Select Valid ID Type</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.valid_id_type}
                      onValueChange={itemValue =>
                        handleChange('valid_id_type', itemValue)
                      }
                      style={styles.picker}
                      dropdownIconColor="#2D6A4F">
                      <Picker.Item label="Driver's License" value="1" />
                      <Picker.Item label="SSS Card" value="2" />
                      <Picker.Item label="Unified Multi-purpose ID" value="3" />
                      <Picker.Item label="Voter's ID" value="4" />
                      <Picker.Item
                        label="Philippine Identification System (PhilSys) ID"
                        value="5"
                      />
                      <Picker.Item label="Postal ID" value="6" />
                      <Picker.Item
                        label="Tax Identification Number (TIN)"
                        value="7"
                      />
                    </Picker>
                  </View>

                  {/* ID Number Input */}
                  <Text style={styles.uploadLabel}>ID Number</Text>
                  <InputComponent
                    placeholder="Enter ID Number"
                    value={formData.id_number}
                    onChangeText={text => handleChange('id_number', text)}
                  />

                  {/* Valid ID Front Upload */}
                  <Text style={styles.uploadLabel}>Upload Valid ID Front</Text>
                  <TouchableOpacity
                    onPress={() => handleImagePick('valid_id_front')}
                    style={styles.uploadButton}>
                    <Text style={styles.uploadButtonText}>Select Image</Text>
                  </TouchableOpacity>
                  {formData.valid_id_front && (
                    <Image
                      source={{uri: formData.valid_id_front.uri}}
                      style={styles.imagePreview}
                    />
                  )}

                  {/* Valid ID Back Upload */}
                  <Text style={styles.uploadLabel}>Upload Valid ID Back</Text>
                  <TouchableOpacity
                    onPress={() => handleImagePick('valid_id_back')}
                    style={styles.uploadButton}>
                    <Text style={styles.uploadButtonText}>Select Image</Text>
                  </TouchableOpacity>
                  {formData.valid_id_back && (
                    <Image
                      source={{uri: formData.valid_id_back.uri}}
                      style={styles.imagePreview}
                    />
                  )}

                  {/* Barangay Clearance Upload */}
                  <Text style={styles.uploadLabel}>
                    Upload Barangay Clearance
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleImagePick('brgy_clearance')}
                    style={styles.uploadButton}>
                    <Text style={styles.uploadButtonText}>Select Image</Text>
                  </TouchableOpacity>
                  {formData.brgy_clearance && (
                    <Image
                      source={{uri: formData.brgy_clearance.uri}}
                      style={styles.imagePreview}
                    />
                  )}
                </>
              )}
            </View>
          </Stepper.Step>
        </Stepper>

        {/* Navigation buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity onPress={handlePrev} style={styles.button}>
              <Text style={styles.buttonText}>Previous</Text>
            </TouchableOpacity>
          )}
          {currentStep < 2 && (
            <TouchableOpacity onPress={handleNext} style={styles.button}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          )}
          {currentStep === 2 && (
            <TouchableOpacity
              onPress={handleRegister}
              style={[styles.button, loading && styles.buttonDisabled]}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Loading feedback */}
        {isRegistering && <OptimisticFeedback action="register" />}
        <ErrorAlertModal
          visible={showErrorModal}
          title={title}
          message={responseErrorMessage}
          onDismiss={() => setShowErrorModal(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#95D5B2',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#40916C',
    padding: 10,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stepContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white',
  },
  picker: {
    height: 40,
    fontSize: 14,
    color: '#081C15',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#40916C',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    height: 45,
    justifyContent: 'center',
    marginBottom: 12,
  },

  uploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: 'white',
  },
  uploadButton: {
    backgroundColor: '#40916C',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 8,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    padding: 10,
  },
  centerStepContent: {
    marginTop: 20,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  passwordNote: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default Register;
