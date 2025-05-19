import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {post} from '../utils/proxy';
import ButtonComponent from '../components/Button';
import InputComponent from '../components/Input';
import PasswordInput from '../components/PasswordInput';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_ENDPOINTS} from '../api/api-endpoints';
import {RootStackParamList} from '../types/passenger-dashboard';
import LoginButtonComponent from '../components/LoginButton';
import {LoginPayload} from '../types/login';
import OptimisticFeedback from '../components/Loading';
import {Modal, Pressable, ScrollView, TouchableOpacity} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

// Map user type IDs to user type names
const userTypeMap: {[key: number]: string} = {
  6: 'Driver',
  7: 'Dispatcher',
  8: 'Passenger',
};

const Login: React.FC = () => {
  const [emailOrMobile, setEmailOrMobile] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginAttempts, setLoginAttempts] = useState<number>(0); // Track login attempts
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false); // Disable button after 3 attempts
  const [retryTime, setRetryTime] = useState<number>(0); // Countdown time in seconds
  const navigation = useNavigation<NavigationProps>();
  const [isTermsChecked, setIsTermsChecked] = useState<boolean>(false);
  const [isTermsModalVisible, setIsTermsModalVisible] =
    useState<boolean>(false);
  const [isCheckboxEnabled, setIsCheckboxEnabled] = useState<boolean>(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] =
    useState<boolean>(false);
  const [hasUserConfirmedRead, setHasUserConfirmedRead] = useState(false);

  // This useEffect will trigger when loginAttempts change
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    // If login attempts exceed 3, disable button and start countdown
    if (loginAttempts >= 3) {
      setIsButtonDisabled(true);
      setRetryTime(60); // Set the initial retry time to 60 seconds

      // Start the countdown
      timer = setInterval(() => {
        setRetryTime(prevTime => {
          if (prevTime <= 1) {
            // Once countdown finishes, enable button and reset login attempts
            setIsButtonDisabled(false);
            setLoginAttempts(0);
            clearInterval(timer); // Clear the interval
            return 0;
          }
          return prevTime - 1; // Decrement the retry time
        });
      }, 1000);
    }

    // Cleanup the timer when the component unmounts or if loginAttempts reset
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [loginAttempts]); // This will run only when loginAttempts change

  useEffect(() => {
    const loadTermsStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('termsAccepted');
        if (value === 'true') {
          setIsTermsChecked(true);
        } else {
          setIsTermsChecked(false);
        }
      } catch (e) {
        console.error('Failed to load termsAccepted:', e);
      }
    };

    loadTermsStatus();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);

    const payload: LoginPayload = {
      email_or_mobile: emailOrMobile,
      password: password,
    };

    try {
      // First, check if the user exists and is approved
      const userStatus = await post(API_ENDPOINTS.CHECK_USER_STATUS, {
        email_or_mobile: emailOrMobile,
      });

      if (userStatus?.is_approved === 0) {
        Toast.show({
          type: 'error',
          text1: 'Account Pending Approval',
          text2: 'Your account has not been approved by the president yet.',
        });
        return;
      }

      // Proceed with login
      const data = await post(API_ENDPOINTS.LOGIN, payload);

      if (data?.status === false) {
        // If login failed
        const errorMessage = data?.message || 'Login Failed';
        const retryAfter = data?.retry_after;

        if (retryAfter && retryAfter > 0) {
          setRetryTime(retryAfter); // Set retry time for UI update
          setLoginAttempts(3); // Disable the button after 3 failed attempts
        }

        Toast.show({
          type: 'error',
          text1: errorMessage,
          text2: retryAfter
            ? `Please try again in ${retryAfter.toFixed(0)} seconds.`
            : '',
        });
        return;
      }

      // Successful login flow
      const token = data.access_token;
      const userType = data.user.user_type_id;
      await AsyncStorage.setItem('userId', data.user.id.toString());
      await AsyncStorage.setItem('userType', userType.toString());

      if (token) {
        await AsyncStorage.setItem('userToken', token);
        const userTypeName = userTypeMap[userType] || 'User';

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: `Welcome ${
            userTypeName.charAt(0).toUpperCase() + userTypeName.slice(1)
          }!`,
        });

        switch (userType) {
          case 6:
            navigation.replace('DriverDashboard');
            break;
          case 7:
            navigation.replace('DispatcherDashboard');
            break;
          case 8:
            navigation.replace('PassengerDashboard');
            break;
          default:
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Invalid user type.',
            });
        }
      } else {
        throw new Error('Token not found in response.');
      }
    } catch (error: any) {
      console.log('API request error:', error);
      const errorMessage =
        error?.response?.data?.message || 'An unexpected error occurred.';

      if (error?.response?.status === 403) {
        if (errorMessage.toLowerCase().includes('not approved')) {
          Toast.show({
            type: 'error',
            text1: 'Account Not Approved',
            text2: 'Your account has not been approved by the president yet.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Email Not Verified',
            text2: 'Please verify your email before logging in.',
          });
        }
      } else if (error?.response?.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: errorMessage,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: errorMessage,
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
        </View>

        <InputComponent
          placeholder="Email or Mobile"
          value={emailOrMobile}
          onChangeText={setEmailOrMobile}
        />
        <PasswordInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />
        <LoginButtonComponent
          title="Login"
          onPress={handleLogin}
          color="#2D6A4F"
          loading={isLoggingIn}
          disabled={isButtonDisabled || !isTermsChecked} // Disable button after 3 attempts
        />
        <ButtonComponent
          title="Register"
          onPress={() => navigation.navigate('Register')}
          color="#40916C"
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 16,
            justifyContent: 'center',
          }}>
          <CheckBox
            value={isTermsChecked}
            disabled={true} // Read-only
            tintColors={{true: '#2D6A4F', false: 'gray'}}
          />
          <TouchableOpacity onPress={() => setIsTermsModalVisible(true)}>
            <Text style={{color: '#1B4332', textDecorationLine: 'underline'}}>
              I agree to the Terms and Conditions
            </Text>
          </TouchableOpacity>
        </View>
        {/* {__DEV__ && (
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.removeItem('termsAccepted');
              setIsTermsChecked(false);
              Alert.alert('termsAccepted reset. Reload app to see changes.');
            }}
            style={{
              marginTop: 16,
              padding: 10,
              backgroundColor: '#e63946',
              borderRadius: 6,
            }}>
            <Text style={{color: 'white', textAlign: 'center'}}>
              Reset Terms (Dev Only)
            </Text>
          </TouchableOpacity>
        )} */}

        {isLoggingIn && <OptimisticFeedback action="login" />}

        {/* Show retry time countdown */}
        {isButtonDisabled && retryTime > 0 && (
          <Text style={styles.retryText}>
            Please wait {retryTime} seconds before trying again.
          </Text>
        )}
        <Modal
          visible={isTermsModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {}}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              padding: 20,
            }}>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 20,
                maxHeight: '85%',
              }}>
              <ScrollView
                style={{marginBottom: 10}}
                onScroll={({nativeEvent}) => {
                  const {layoutMeasurement, contentOffset, contentSize} =
                    nativeEvent;
                  const isBottomReached =
                    layoutMeasurement.height + contentOffset.y >=
                    contentSize.height - 20;

                  if (isBottomReached && !hasScrolledToBottom) {
                    setHasScrolledToBottom(true);
                  }
                }}
                scrollEventThrottle={16}>
                <Text style={{fontSize: 16, color: '#000', marginBottom: 16}}>
                  By using the{' '}
                  <Text style={{fontWeight: 'bold'}}>BATODA app</Text>, you
                  agree to the following Terms and Conditions:
                </Text>

                {[
                  {
                    title: '1. GCash Payment Requirement',
                    bullets: [
                      'All users are required to have an active GCash account to enable cashless transactions.',
                      'The Batoda app will access a secure payment gateway that links to the GCash app to ensure smooth transactions.',
                    ],
                  },

                  {
                    title: '2. No Refund Policy',
                    bullets: [
                      'All payments made are non-refundable.',
                      'Once a transaction is completed, no cancellations or refund requests will be entertained.',
                    ],
                  },
                  {
                    title: '3. Seat Policy',
                    bullets: [
                      'Strictly one (1) person per seat.',
                      'Sabakanay (2 persons on 1 seat) is not allowed, except if the second passenger is a baby or a small child accompanied by an adult',
                    ],
                  },
                  {
                    title: '4. Passenger Conduct',
                    bullets: [
                      'Passengers must respect the driver and fellow riders.',
                      'Aggressive behavior or intoxication may result in removal or banning.',
                    ],
                  },
                  {
                    title: '5. Driver Conduct',
                    bullets: [
                      'Drivers must follow traffic laws and behave professionally.',
                      'Misconduct should be reported via BATODA channels.',
                    ],
                  },
                  {
                    title: '6. Fare Disputes',
                    bullets: [
                      'Confirm fare before the ride.',
                      'Disputes without proof will not be entertained.',
                    ],
                  },
                  {
                    title: '7. Trip Responsibility',
                    bullets: [
                      'BATODA is not liable for delays due to traffic, weather, or other uncontrollable factors.',
                      'BATODA is not responsible for lost items.',
                    ],
                  },
                  {
                    title: '8. Safety Measures',
                    bullets: [
                      'No standing or hanging on the sidebars during rides.',
                      'Children must be with an adult.',
                    ],
                  },
                  {
                    title: '9. Data Privacy',
                    bullets: [
                      'Your personal and trip data will be handled securely.',
                      'It will be used only to improve services.',
                    ],
                  },
                  {
                    title: '10. Violations and Banning',
                    bullets: [
                      'Violating these terms may lead to suspension or permanent ban from the service.',
                    ],
                  },
                ].map((section, index) => (
                  <View key={index} style={{marginBottom: 16}}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#000',
                        marginBottom: 6,
                      }}>
                      {section.title}
                    </Text>
                    {section.bullets.map((bullet, i) => (
                      <Text
                        key={i}
                        style={{
                          fontSize: 15,
                          color: '#333',
                          marginLeft: 12,
                          marginBottom: 4,
                        }}>
                        • {bullet}
                      </Text>
                    ))}
                  </View>
                ))}

                <Text style={{fontSize: 16, marginTop: 10, color: '#000'}}>
                  By continuing, you agree to comply with the above Terms and
                  Conditions.
                </Text>
              </ScrollView>

              {hasScrolledToBottom && (
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 10,
                      marginBottom: 12,
                    }}>
                    <CheckBox
                      value={hasUserConfirmedRead}
                      onValueChange={val => setHasUserConfirmedRead(val)}
                      tintColors={{true: '#2D6A4F', false: 'gray'}}
                    />
                    <Text style={{marginLeft: 8, color: '#000'}}>
                      I've read and understood the {'\n'}Terms and Conditions
                    </Text>
                  </View>

                  <Pressable
                    style={{
                      backgroundColor: '#2D6A4F',
                      padding: 10,
                      borderRadius: 8,
                      opacity: hasUserConfirmedRead ? 1 : 0.5,
                    }}
                    disabled={!hasUserConfirmedRead}
                    onPress={async () => {
                      setIsTermsModalVisible(false);
                      setIsCheckboxEnabled(true);
                      setIsTermsChecked(true);
                      await AsyncStorage.setItem('termsAccepted', 'true');
                    }}>
                    <Text style={{textAlign: 'center', color: 'white'}}>
                      Continue
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#95D5B2',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  retryText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
    marginTop: 10,
  },
});

export default Login;
