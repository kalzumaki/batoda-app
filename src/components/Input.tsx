// src/components/InputComponent.tsx

import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

interface InputComponentProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

const InputComponent: React.FC<InputComponentProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  maxLength,
  ...props
}) => {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#A9A9A9"
      keyboardType={keyboardType}
      maxLength={maxLength}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: '#A9A9A9',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    fontSize: 16,
    color: '#000',
  },
});

export default InputComponent;
