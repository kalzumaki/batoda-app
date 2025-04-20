import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';
import {get, postFormData} from '../utils/proxy';
import {API_ENDPOINTS} from '../api/api-endpoints';
import BackButton from '../components/BackButton';
import {STORAGE_API_URL} from '@env';

const UploadValidId: React.FC = () => {
  const [validIdTypes, setValidIdTypes] = useState<
    {id: number; name: string}[]
  >([]);
  const [validIdType, setValidIdType] = useState<number | null>(null); // store id
  const [idNumber, setIdNumber] = useState<string>('');
  const [frontImage, setFrontImage] = useState<Asset | null>(null);
  const [backImage, setBackImage] = useState<Asset | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [validIdData, setValidIdData] = useState<any>(null);
  const [loadingValidIdData, setLoadingValidIdData] = useState<boolean>(true);

  const fetchValidIdData = async () => {
    setLoadingValidIdData(true);
    try {
      const response = await get(API_ENDPOINTS.GET_VALID_ID);
      if (response.status && response.data.length > 0) {
        const validId = response.data[0];
        const frontImageUrl = `${STORAGE_API_URL}/storage/${validId.front_image}`;
        const backImageUrl = `${STORAGE_API_URL}/storage/${validId.back_image}`;

        setValidIdData(validId);
        setValidIdType(validId?.valid_id_type.id);
        setIdNumber(validId?.id_number);
        setFrontImage({uri: frontImageUrl});
        setBackImage({uri: backImageUrl});
      }
    } catch (error) {
      console.error('Error fetching valid ID data', error);
    } finally {
      setLoadingValidIdData(false);
    }
  };
  useEffect(() => {
    fetchValidIdData();
  }, []);

  useEffect(() => {
    const fetchIdTypes = async () => {
      try {
        const response = await get(API_ENDPOINTS.GET_VALID_ID_TYPES);
        if (response.status) {
          setValidIdTypes(response.data);
        } else {
          Alert.alert('Error', 'Failed to fetch ID types');
        }
      } catch (error) {
        Alert.alert('Error', 'Could not load valid ID types.');
      }
    };

    fetchIdTypes();
  }, []);

  const handleSubmit = async () => {
    if (!validIdType || !idNumber) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    // Check if front and back images are already selected
    if (!frontImage) {
      Alert.alert('Validation Error', 'Please select front image.');
      return;
    }

    if (!backImage) {
      Alert.alert('Validation Error', 'Please select back image.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('valid_id_type', validIdType.toString());
    formData.append('id_number', idNumber);

    // Use the already selected frontImage and backImage from state
    formData.append('front_image', {
      uri: frontImage.uri!,
      name: frontImage.fileName || `front_${Date.now()}.jpg`,
      type: frontImage.type || 'image/jpeg',
    });

    formData.append('back_image', {
      uri: backImage.uri!,
      name: backImage.fileName || `back_${Date.now()}.jpg`,
      type: backImage.type || 'image/jpeg',
    });

    try {

      const response = await get(API_ENDPOINTS.GET_VALID_ID);

      if (response.status && response.data.length > 0) {

        const validId = response.data[0];
        const updateResponse = await postFormData(
          API_ENDPOINTS.UPDATE_VALID_ID,
          formData,
          true,
        );

        if (updateResponse.status) {
          Alert.alert('Success', 'Valid ID updated successfully!');
          await fetchValidIdData();
        } else {
          Alert.alert(
            'Update Failed',
            updateResponse.message || 'Please try again.',
          );
        }
      } else {
        const addResponse = await postFormData(
          API_ENDPOINTS.ADD_VALID_ID,
          formData,
          true,
        );

        if (addResponse.status) {
          Alert.alert('Success', 'Upload successful!');
          await fetchValidIdData();
        } else {
          Alert.alert(
            'Upload Failed',
            addResponse.message || 'Please try again.',
          );
        }
      }
    } catch (error: any) {
      console.error('Error submitting data:', error);
      Alert.alert('Error', 'An error occurred while submitting the data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton />

        {loadingValidIdData ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#3d5554" />
          </View>
        ) : (
          <>
            <Text style={styles.title}>Upload Valid ID</Text>

            <Text style={styles.label}>Valid ID Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={validIdType}
                onValueChange={itemValue => setValidIdType(itemValue)}
                style={styles.picker}
                dropdownIconColor="#000">
                <Picker.Item label="Select an ID Type" value={null} />
                {validIdTypes.map(type => (
                  <Picker.Item
                    key={type.id}
                    label={type.name}
                    value={type.id}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>ID Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your ID number"
              placeholderTextColor="#999"
              value={idNumber}
              onChangeText={setIdNumber}
            />

            <Text style={styles.imageNote}>
              Please upload both the front and back images of your valid ID.
            </Text>

            {/* Front Image Picker */}
            <TouchableOpacity
              style={styles.imageButton}
              onPress={async () => {
                const pickerResult = await launchImageLibrary({
                  mediaType: 'photo',
                  maxWidth: 1000,
                  maxHeight: 1000,
                  quality: 1,
                });

                if (!pickerResult.didCancel && pickerResult.assets?.length) {
                  console.log('Front Image:', pickerResult.assets[0]);
                  setFrontImage(pickerResult.assets[0]);
                }
              }}>
              <Text style={styles.imageButtonText}>Select Front Image</Text>
            </TouchableOpacity>
            {frontImage && (
              <Image
                source={{uri: frontImage.uri}}
                style={styles.imagePreview}
              />
            )}

            {/* Back Image Picker */}
            <TouchableOpacity
              style={styles.imageButton}
              onPress={async () => {
                const pickerResult = await launchImageLibrary({
                  mediaType: 'photo',
                  maxWidth: 1000,
                  maxHeight: 1000,
                  quality: 1,
                });

                if (!pickerResult.didCancel && pickerResult.assets?.length) {
                  console.log('Back Image:', pickerResult.assets[0]);
                  setBackImage(pickerResult.assets[0]);
                }
              }}>
              <Text style={styles.imageButtonText}>Select Back Image</Text>
            </TouchableOpacity>
            {backImage && (
              <Image
                source={{uri: backImage.uri}}
                style={styles.imagePreview}
              />
            )}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UploadValidId;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3d5554',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  label: {
    color: '#3d5554',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#f0f4f3',
    color: '#000',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  imageButton: {
    backgroundColor: '#469c8f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
  },
  submitButton: {
    backgroundColor: '#62a287',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#f0f4f3',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  picker: {
    color: '#000',
    height: 50,
    width: '100%',
  },
  imageNote: {
    color: '#666',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 5,
    textAlign: 'center',
  },
});
