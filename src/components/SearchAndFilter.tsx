import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface SearchAndFilterProps {
  searchPlaceholder?: string;
  onSearchChange?: (text: string) => void;
  onDateSelected?: (date: string) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchPlaceholder = 'Search',
  onSearchChange,
  onDateSelected,
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    const today = new Date();

    // Reset both today and selected date to midnight for accurate comparison
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (selectedDate > currentDate) {
      Alert.alert('Future dates are not allowed.');
      hideDatePicker();
      return;
    }

    const formattedDate = selectedDate.toISOString().split('T')[0]; 
    setSelectedDate(formattedDate);
    onDateSelected?.(formattedDate);
    hideDatePicker();
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder={searchPlaceholder}
        placeholderTextColor="#c6d9d7"
        onChangeText={onSearchChange}
      />
      {/* Date Button */}
      <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
        <Text style={styles.dateButtonText}>
          {selectedDate || 'Select Date'}
        </Text>
      </TouchableOpacity>

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        maximumDate={new Date()} // Prevents selecting future dates
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#469c8f',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    color: 'black',
  },
  dateButton: {
    backgroundColor: '#469c8f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  dateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SearchAndFilter;
