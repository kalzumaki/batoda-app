import React, {useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/passenger-dashboard';
import {useNavigation} from '@react-navigation/native';
import {useNotification} from '../contexts/NotificationContext'; // Adjust path if needed
import BackButton from '../components/BackButton';

type NotificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NotificationScreen'
>;

const NotificationScreen: React.FC = () => {
  const navigation = useNavigation<NotificationScreenNavigationProp>();
  const {notifications, clearNotifications} = useNotification();

  useEffect(() => {
    clearNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Notifications</Text>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications 🎉</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={styles.notificationItem}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  notificationItem: {
    padding: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 16,
    color: '#555',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

export default NotificationScreen;
