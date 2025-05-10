import {
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {del, get, put} from '../utils/proxy';
import {API_ENDPOINTS} from '../api/api-endpoints';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types/passenger-dashboard';
import BackButton from '../components/BackButton';
import Icon from 'react-native-vector-icons/Ionicons';
import SuccessAlertModal from '../components/SuccessAlertModal';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

interface NotificationItem {
  id: number;
  type: string;
  payload: {
    message: string;
    dispatch_id?: number;
    seat_positions?: string[];
  };
  read_at: string | null;
  created_at: string;
}

// Helper: Convert technical seat names to user-friendly names
const formatSeatName = (seat: string): string => {
  return seat
    .replace(/_/g, ' ')
    .replace(
      /\b(front|back|middle)\b/,
      match => match.charAt(0).toUpperCase() + match.slice(1),
    )
    .replace(
      /\b(small|big)\b/,
      match => match.charAt(0).toUpperCase() + match.slice(1),
    );
};

const NotificationScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showResponseMessage, setShowResponseMessage] = useState<string>('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [title, setTitle] = useState<string>('');
  const fetchNotifications = async () => {
    try {
      const response = await get(API_ENDPOINTS.GET_NOTIF_PER_USER);
      if (response?.status) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = async (notification: NotificationItem) => {
    setSelectedNotification(notification);

    if (notification.read_at === null) {
      try {
        await put(
          API_ENDPOINTS.NOTIF_MARK_AS_READ.replace(
            '{id}',
            notification.id.toString(),
          ),
          {},
          true, // assuming auth is needed
        );

        // Update local state to reflect that it's now read
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id
              ? {...n, read_at: new Date().toISOString()}
              : n,
          ),
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };
  const handleClearNotifications = async () => {
    try {
      const response = await del(API_ENDPOINTS.CLEAR_NOTIF, true);
      if (response.message) {
        setNotifications([]);
        setShowResponseMessage(response.message);
        setTitle('Notifications Cleared');
        setIsSuccessModalVisible(true);
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const renderItem = ({item}: {item: NotificationItem}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleNotificationPress(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.type}>{item.type.replace(/_/g, ' ')}</Text>
        {item.read_at === null && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>Unread</Text>
          </View>
        )}
      </View>
      <Text style={styles.message} numberOfLines={2}>
        {item.payload.message}
      </Text>
      <Text style={styles.time}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Notifications</Text>
      {/* Trashcan icon */}
      <TouchableOpacity
        style={styles.trashIconContainer}
        onPress={handleClearNotifications}>
        <Icon name="trash-bin" size={15} color="#fff" />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#469c8f" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={!!selectedNotification} transparent animationType="none">
        <TouchableWithoutFeedback onPress={() => setSelectedNotification(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedNotification && (
                <>
                  <Text style={styles.modalTitle}>
                    {selectedNotification.type.replace(/_/g, ' ')}
                  </Text>
                  <Text style={styles.modalMessage}>
                    {selectedNotification.payload.message}
                  </Text>

                  {selectedNotification.payload.seat_positions?.length ? (
                    <View style={styles.seatContainer}>
                      <Text style={styles.modalSeatsTitle}>
                        Seats Reserved:
                      </Text>
                      {selectedNotification.payload.seat_positions.map(seat => (
                        <Text key={seat} style={styles.seatItem}>
                          • {formatSeatName(seat)}
                        </Text>
                      ))}
                    </View>
                  ) : null}

                  <Text style={styles.modalDate}>
                    {new Date(selectedNotification.created_at).toLocaleString()}
                  </Text>
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <SuccessAlertModal
        visible={isSuccessModalVisible}
        title={title}
        message={showResponseMessage}
        onDismiss={() => {
          setIsSuccessModalVisible(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    alignSelf: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#469c8f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    textTransform: 'capitalize',
  },
  unreadBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unreadText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 12,
  },
  message: {
    color: '#fff',
    marginTop: 6,
    marginBottom: 8,
  },
  time: {
    color: '#e0e0e0',
    fontSize: 12,
    textAlign: 'right',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
    color: '#333',
    textTransform: 'capitalize',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 14,
    color: '#555',
  },
  seatContainer: {
    marginBottom: 14,
  },
  modalSeatsTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#444',
  },
  seatItem: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  modalDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  trashIconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ff6347',
    padding: 10,
    borderRadius: 30,
  },
});

export default NotificationScreen;
