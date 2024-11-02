import React, {useState} from 'react';
import {View, TextInput, StyleSheet, TouchableOpacity} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

interface PasswordInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: object;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  placeholder,
  value,
  onChangeText,
  style,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!isPasswordVisible}
        placeholderTextColor="#A9A9A9"
      />
      <TouchableOpacity
        onPress={togglePasswordVisibility}
        style={styles.iconContainer}>
        <FontAwesomeIcon
          name={isPasswordVisible ? 'eye' : 'eye-slash'}
          size={20}
          color="#2D6A4F"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A9A9A9',
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 10,
    paddingRight: 40,
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    padding: 5,
  },
});

export default PasswordInput;
