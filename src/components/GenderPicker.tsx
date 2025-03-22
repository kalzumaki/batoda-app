import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface GenderPickerProps {
  selectedGender: string;
  onSelectGender: (gender: string) => void;
}

const GenderPicker: React.FC<GenderPickerProps> = ({
  selectedGender,
  onSelectGender,
}) => {
  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  return (
    <View style={styles.container}>
      {genders.map(({ value, label }) => (
        <TouchableOpacity
          key={value}
          onPress={() => onSelectGender(value)}
        >
          <Text
            style={[
              styles.option,
              selectedGender === value && styles.selected,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  option: {
    fontSize: 16,
    color: 'gray',
    paddingVertical: 8,
  },
  selected: {
    color: '#469c8f',
    fontWeight: 'bold',
  },
});

export default GenderPicker;
