import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface DropdownProps {
  label: string;
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  options: { label: string; value: string | number }[];
}

const DropdownComponent: React.FC<DropdownProps> = ({ label, selectedValue, onValueChange, options }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(value) => onValueChange(value)}
          style={styles.picker}
          dropdownIconColor="#2D6A4F" // Matching your theme color
        >
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#081C15',
    marginBottom: 4,
    fontWeight: '500',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#40916C',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    height: 45,
    justifyContent: 'center',
  },
  picker: {
    height: 40,
    fontSize: 14,
    color: '#081C15',
  },
});

export default DropdownComponent;
