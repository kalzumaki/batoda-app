import React, {useState, useEffect, useCallback} from 'react';
import {RefreshTriggerProp} from '../../types/passenger-dashboard';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {get} from '../../utils/proxy';
import {Dispatch, DispatchResponse} from '../../types/approved-dispatch';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {API_URL, STORAGE_API_URL} from '@env';
import useSocketListener from '../../hooks/useSocketListener';
const ShowInQueue: React.FC<RefreshTriggerProp> = ({refreshTrigger}) => {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(
    null,
  );
  const [passengerCount, setPassengerCount] = useState<number>(0);

  const [profileImage, setProfileImage] = useState<string>(
    '../../assets/25.png',
  );
  const [minutesLeft, setMinutesLeft] = useState<{[id: number]: number}>({});

  const fetchInQueue = async () => {
    try {
      const response: DispatchResponse = await get(API_ENDPOINTS.IN_QUEUE);
      if (response.status) {
        const activeDispatches = response.dispatches.filter(
          dispatch => dispatch.is_dispatched !== 1,
        );

        const initialMinutesLeft = activeDispatches.reduce((acc, dispatch) => {
          const scheduledTimeMs = new Date(
            dispatch.scheduled_dispatch_time,
          ).getTime();
          const currentTimeMs = new Date().getTime();
          acc[dispatch.id] = Math.max(
            0,
            Math.ceil((scheduledTimeMs - currentTimeMs) / 60000),
          );
          return acc;
        }, {} as {[id: number]: number});

        setMinutesLeft(initialMinutesLeft);
        setDispatches(activeDispatches);
      } else {
        setDispatches([]);
      }
    } catch (error) {
      console.error('Error fetching dispatch:', error);
      setDispatches([]);
    }
  };

  const checkUser = async () => {
    try {
      const response = await get(API_ENDPOINTS.USERS_TOKEN);
      if (response.data?.profile) {
        setProfileImage(`${STORAGE_API_URL}/storage/${response.data.profile}`);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    fetchInQueue();
  }, [refreshTrigger]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesLeft(prevMinutesLeft => {
        const updatedMinutesLeft = {...prevMinutesLeft};
        Object.keys(updatedMinutesLeft).forEach(id => {
          updatedMinutesLeft[parseInt(id)] = Math.max(
            0,
            updatedMinutesLeft[parseInt(id)] - 1,
          );
        });
        return updatedMinutesLeft;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatches]);

  const handleDispatchUpdated = useCallback((data: any) => {
    console.log('Dispatch updated:', data);
    fetchInQueue();
  }, []);

  const handleDispatchFinalized = useCallback((data: any) => {
    console.log('Dispatch finalized:', data);
    fetchInQueue();
  }, []);

  useSocketListener('dispatch-updated', handleDispatchUpdated);
  useSocketListener('dispatch-finalized', handleDispatchFinalized);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Dispatch</Text>
      {dispatches.length > 0 ? (
        <FlatList
          data={dispatches}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.dispatchItem}
              onPress={() => {
                setSelectedDispatch(item);
                setModalVisible(true);
                checkUser();
              }}>
              <Text style={styles.dispatchText}>
                Driver: {item.driver.fname} {item.driver.lname}
              </Text>
              <Text style={styles.dispatchText}>
                Tricycle No.: {item.tricycle.tricycle_number}
              </Text>
              <Text style={styles.dispatchText}>
                Dispatch By: {item.dispatcher.fname} {item.dispatcher.lname}
              </Text>
              <Text style={styles.timeLeftText}>
                Time Left: {minutesLeft[item.id] ?? 0} min
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noQueueText}>No upcoming dispatch.</Text>
      )}

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#62a287" />
                </TouchableOpacity>

                <View style={styles.passportContainer}>
                  {profileImage ? (
                    <Image
                      source={
                        selectedDispatch?.driver.profile
                          ? {
                              uri: `${API_URL}storage/${selectedDispatch.driver.profile}`,
                            }
                          : require('../../assets/25.png')
                      }
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.profilePlaceholder}>
                      <Icon name="person" size={50} color="#62a287" />
                    </View>
                  )}

                  {selectedDispatch && (
                    <View style={styles.detailsContainer}>
                      <Text style={styles.modalText}>
                        <Text style={styles.label}>Tricycle No.: </Text>
                        {selectedDispatch.tricycle.tricycle_number}
                      </Text>
                      <Text style={styles.modalText}>
                        <Text style={styles.label}>Name: </Text>
                        {selectedDispatch.driver.fname}{' '}
                        {selectedDispatch.driver.lname}
                      </Text>
                      <Text style={styles.modalText}>
                        <Text style={styles.label}>Dispatch by: </Text>
                        {selectedDispatch.dispatcher.fname}{' '}
                        {selectedDispatch.dispatcher.lname}
                      </Text>
                      <Text style={styles.modalText}>
                        <Text style={styles.label}>Seat Count: </Text>
                        {passengerCount}
                      </Text>
                      <Text style={styles.modalText}>
                        <Text style={styles.label}>Time Left: </Text>
                        {minutesLeft[selectedDispatch.id] ?? 0} min
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // backgroundColor: '#c6d9d7',
  },

  timeLeftText: {fontSize: 16, color: 'white'},
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3d5554',
  },
  noQueueText: {
    fontSize: 16,
    color: '#2d665f',
    textAlign: 'center',
    marginTop: 20,
  },
  dispatchItem: {
    backgroundColor: '#62a287',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dispatchText: {
    fontSize: 16,
    color: '#f9f9f9',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 320,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
    padding: 5,
  },
  passportContainer: {
    flexDirection: 'row', // Layout side by side
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailsContainer: {
    flex: 1,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#3d5554',
  },
  label: {
    fontWeight: 'bold',
    color: '#2d665f',
  },
});

export default ShowInQueue;
