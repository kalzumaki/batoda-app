import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types/passenger-dashboard';
import Icon from 'react-native-vector-icons/Ionicons';

// Proper route typing
type EditProfileRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EditProfileRouteProp>();
  const {field, value} = route.params;

  // Local state to handle editing
  const [editedValue, setEditedValue] = useState(value);

  const handleCancel = () => navigation.goBack();

  const handleSubmit = () => {
    Alert.alert('Saved', `${field} updated to: ${editedValue}`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Icon name="close" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {field
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, c => c.toUpperCase())}
        </Text>
        <TouchableOpacity onPress={handleSubmit}>
          <Icon name="checkmark" size={28} color="#469c8f" />
        </TouchableOpacity>
      </View>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {field
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, c => c.toUpperCase())}
        </Text>
        <TextInput
          style={styles.input}
          value={editedValue}
          onChangeText={setEditedValue}
        />
        <Text style={styles.description}>
          Use the name people recognize you by, whether it's your full name or
          your business name, to help others find your account.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    // fontWeight: 'bold',
    color: 'black',
  },
  inputContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    color: '#469c8f',
  },
  input: {
    fontSize: 16,
    color: 'black',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginTop: 5,
  },
  description: {
    marginTop: 10,
    fontSize: 12,
    color: '#469c8f',
  },
});

export default EditProfileScreen;
