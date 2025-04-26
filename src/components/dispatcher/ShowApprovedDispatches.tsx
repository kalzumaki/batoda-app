import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {get, post} from '../../utils/proxy';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {DispatchResponseByDispatcher} from '../../types/approved-dispatch';
import {STORAGE_API_URL} from '@env';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import dayjs from 'dayjs';
import {RefreshTriggerProp} from '../../types/passenger-dashboard';
import Toast from 'react-native-toast-message';
import SuccessAlertModal from '../SuccessAlertModal';
import ErrorAlertModal from '../ErrorAlertModal';

const ShowApprovedDispatches: React.FC<RefreshTriggerProp> = ({
  refreshTrigger,
}) => {
  const [dispatches, setDispatches] = useState<
    DispatchResponseByDispatcher['dispatches']
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dispatchOptions, setDispatchOptions] = useState<any[]>([]);
  const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false);
  const [currentDispatch, setCurrentDispatch] = useState<any>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResponseMessage, setShowResponseMessage] = useState<string>('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [title, setTitle] = useState<string>('');
  const fetchDispatches = async () => {
    try {
      setLoading(true);
      const response: DispatchResponseByDispatcher = await get(
        API_ENDPOINTS.GET_APPROVED_DISPATCHES_BY_DISPATCHER,
      );
      if (response.status) {
        setDispatches(response.dispatches);
      }
    } catch (error) {
      console.error('Error fetching dispatches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDispatchOptions = async () => {
    try {
      const response = await get(API_ENDPOINTS.GET_DISPATCH_OPTIONS);
      setDispatchOptions(response);
    } catch (error) {
      console.error('Error fetching dispatch options:', error);
    }
  };

  useEffect(() => {
    fetchDispatches();
    fetchDispatchOptions();
  }, [refreshTrigger]);

  const handleShowOptions = (dispatch: any) => {
    setCurrentDispatch(dispatch);
    setShowOptionsModal(true);
  };

  const handleCloseModal = () => {
    setShowOptionsModal(false);
    setCurrentDispatch(null);
  };

  const handleOptionSelect = async (option: any) => {
    try {
      setShowOptionsModal(false);

      const payload = {
        dispatch_id: currentDispatch.id,
        dispatch_option_id: option.id,
      };

      const response = await post(API_ENDPOINTS.DISPATCH_NOW, payload, true);

      if (response.status) {
        setShowResponseMessage(response.message);
        setTitle('Dispatch Successful');
        setIsSuccessModalVisible(true);

        setDispatches(prev =>
          prev.filter(item => item.id !== currentDispatch.id),
        );

        fetchDispatches();
      } else {
        setShowResponseMessage(response.message);
        setTitle('Dispatch Failed');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error('Dispatch error:', error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong while dispatching.';
      setShowResponseMessage(message);
      setTitle('Error');
      setShowErrorModal(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : dispatches.length === 0 ? (
        <Text style={styles.emptyText}>No dispatches found.</Text>
      ) : (
        <>
          {dispatches.map(dispatch => (
            <View key={dispatch.id} style={styles.card}>
              <Image
                source={{
                  uri: dispatch.driver.profile
                    ? `${STORAGE_API_URL}/storage/${dispatch.driver.profile}`
                    : `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
                        `${dispatch.driver.fname} ${dispatch.driver.lname}`,
                      )}`,
                }}
                style={styles.image}
                resizeMode="cover"
              />

              <View style={styles.info}>
                <Text style={styles.name}>
                  {dispatch.driver.fname} {dispatch.driver.lname}
                </Text>
                <Text style={styles.subText}>
                  Tricycle #: {dispatch.tricycle.tricycle_number}
                </Text>
                <Text style={styles.subText}>
                  Passenger Count: {dispatch.passenger_count}
                </Text>
                <Text style={styles.subText}>
                  Scheduled: {dayjs(dispatch.scheduled_dispatch_time).fromNow()}
                </Text>
              </View>

              {/* Button to show dispatch options */}
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleShowOptions(dispatch)}>
                <FontAwesomeIcon name="list" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Modal to show dispatch options */}
          {showOptionsModal && currentDispatch && (
            <Modal
              animationType="none"
              transparent={true}
              visible={showOptionsModal}
              onRequestClose={handleCloseModal}>
              <TouchableWithoutFeedback onPress={handleCloseModal}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Dispatch NOW Options</Text>
                    {dispatchOptions.map(option => (
                      <TouchableOpacity
                        key={option.id}
                        style={styles.optionItem}
                        onPress={() => handleOptionSelect(option)}>
                        <Text style={styles.optionText}>
                          {option.option_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          )}
        </>
      )}
      <SuccessAlertModal
        visible={isSuccessModalVisible}
        title={title}
        message={showResponseMessage}
        onDismiss={() => {
          setIsSuccessModalVisible(false);
        }}
      />

      <ErrorAlertModal
        visible={showErrorModal}
        title={title}
        message={showResponseMessage}
        onDismiss={() => setShowErrorModal(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#62a287',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  subText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#888',
  },
  button: {
    backgroundColor: '#2d665f',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  optionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#469c8f',
    marginBottom: 5,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});

export default ShowApprovedDispatches;
