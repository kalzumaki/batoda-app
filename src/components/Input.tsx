// src/components/InputComponent.tsx

import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface InputComponentProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

const InputComponent: React.FC<InputComponentProps> = ({ placeholder, value, onChangeText, secureTextEntry }) => {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#A9A9A9" // Light grey for placeholder
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40, // Height for the input field
    borderColor: '#A9A9A9', // Light grey border color
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF', // White background for the input
    marginBottom: 12,
    fontSize: 16,
    color: '#000', // Black text
  },
});

export default InputComponent;
