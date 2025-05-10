import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

type ButtonComponentProps = {
  title: string;
  onPress: () => void;
  color: string;
  loading?: boolean;
  disabled?: boolean; // Make sure this prop is passed from parent component
};

const LoginButtonComponent: React.FC<ButtonComponentProps> = ({
  title,
  onPress,
  color,
  loading = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, {backgroundColor: color}]}
      onPress={onPress}
      disabled={loading || disabled} // Disable based on loading or disabled prop
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFF" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginButtonComponent;
