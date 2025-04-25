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
import LottieView from 'lottie-react-native'; // ⬅️ Added Lottie import

interface CustomAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  boldParts?: string[];
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  title,
  message,
  boldParts = [],
  isLoading = false,
  onCancel,
  onConfirm,
  confirmText = 'Proceed',
  cancelText = 'Cancel',
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
            {/* ✅ Lottie warning animation */}
            <LottieView
              source={require('../assets/warning-animation.json')}
              autoPlay
              loop
              style={styles.icon}
            />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>
              {renderMessageWithBoldParts()}
            </Text>

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
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    alignItems: 'center',
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  message: {
    marginBottom: 20,
    fontSize: 14,
    color: '#333',
    textAlign: 'justify',
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
    backgroundColor: '#eee',
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

export default CustomAlertModal;
