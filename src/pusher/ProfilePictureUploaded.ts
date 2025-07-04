import React, {useEffect} from 'react';

import {PusherEvent} from '@pusher/pusher-websocket-react-native';
import { API_URL, STORAGE_API_URL } from '@env';


const ProfilePictureListener: React.FC<{userId: string}> = ({userId}) => {

  useEffect(() => {
    const handleProfileUpdated = (event: PusherEvent) => {
      console.log('Event received on profile-updates channel:', event);

      if (event.eventName === 'ProfileUpdated') {
        console.log('Handling ProfileUpdated event');
        console.log('Event data:', event.data);
        if (event.data && event.data.profileImage) {
          const fullImageUrl = `${STORAGE_API_URL}/storage/${event.data.profileImage}`;
          console.log('Updating profile image URL:', fullImageUrl);

        } else {
          console.warn(
            'ProfileUpdated event does not contain profile image data',
          );
        }
      } else {
        console.warn('Received non-ProfileUpdated event:', event.eventName);
      }
    };

    const subscribe = async () => {
      try {
        console.log(
          'Subscribing to profile-updates channel for ProfileUpdated events',
        );

        console.log('Successfully subscribed to profile-updates channel');
      } catch (error) {
        console.error('Error subscribing to profile-updates channel:', error);
      }
    };

    subscribe();

    return () => {
      console.log('Cleaning up subscription from dispatches channel');

    };
  }, [userId]);

  return null; // This component does not render anything
};

export default ProfilePictureListener;
