import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNotification} from '../contexts/NotificationContext';

const NotificationBadge = () => {
  const {unreadCount} = useNotification(); // Directly use unreadCount from the context

  if (unreadCount === 0) {
    return null; // Don't render anything if there are no unread notifications
  }

  return (
    <View style={styles.badgeContainer}>
      <Text style={styles.badgeText}>{unreadCount}</Text>
      {/* Display unread count */}
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationBadge;
