import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from 'react-native';
import LottieView from 'lottie-react-native';

interface SuccessAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss?: () => void;
}

const SuccessAlertModal: React.FC<SuccessAlertModalProps> = ({
  visible,
  title,
  message,
  onDismiss = () => {},
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onDismiss} />
          <View style={styles.modal}>
            <LottieView
              source={require('../assets/success-animation.json')}
              autoPlay
              loop={false}
              style={styles.icon}
            />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{String(message)}</Text>

          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modal: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    alignItems: 'center',
    zIndex: 10,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

export default SuccessAlertModal;
