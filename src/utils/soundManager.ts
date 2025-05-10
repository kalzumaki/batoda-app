// src/utils/soundManager.ts
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

export const playNotificationSound = () => {
  const sound = new Sound('notification.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('Sound Load Error', error);
      return;
    }
    sound.play(() => {
      sound.release(); // Clean up
    });
  });
};
