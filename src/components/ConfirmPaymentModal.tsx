import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import LottieView from 'lottie-react-native';

interface ConfirmPaymentModalProps {
  visible: boolean;
  title: string;
  message: string;
  boldParts?: string[];
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
}

const ConfirmPaymentModal: React.FC<ConfirmPaymentModalProps> = ({
  visible,
  title,
  message,
  boldParts = [],
  isLoading = false,
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
}) => {
  const renderMessageWithBoldParts = () => {
    let parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    boldParts.forEach((boldPart) => {
      const startIndex = message.indexOf(boldPart, lastIndex);
      if (startIndex !== -1) {
        parts.push(message.slice(lastIndex, startIndex));
        parts.push(<Text key={startIndex} style={{ fontWeight: 'bold' }}>{boldPart}</Text>);
        lastIndex = startIndex + boldPart.length;
      }
    });

    parts.push(message.slice(lastIndex));
    return parts;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <LottieView
              source={require('../assets/confirm-transaction.json')}
              autoPlay
              loop
              style={styles.icon}
            />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{renderMessageWithBoldParts()}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={onCancel}
                style={[styles.button, styles.cancelButton]}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmText}>{confirmText}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    alignItems: 'center',
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ConfirmPaymentModal;
