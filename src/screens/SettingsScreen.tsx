import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/passenger-dashboard';
import BackButton from '../components/BackButton';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();

  const profileData = {
    email: 'vanbeethoven123@gmail.com',
    phoneNumber: '0923 947 1234',
    password: '********',
  };

  const handleEdit = (field: string, value: string) => {
    navigation.navigate('EditProfile', { field, value });
  };

  const renderEditableField = (label: string, value: string, field: string) => (
    <View style={styles.fieldContainer} key={field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput style={styles.input} value={value} editable={false} />
        <TouchableOpacity onPress={() => handleEdit(field, value)}>
          <Icon name="pencil-outline" size={20} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
        <BackButton />
      {/* Header */}
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Accounts Details</Text>

      {/* Editable Fields */}
      {renderEditableField('Email', profileData.email, 'email')}
      {renderEditableField('Phone Number', profileData.phoneNumber, 'phoneNumber')}
      {renderEditableField('Password', profileData.password, 'password')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    // fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: 'black',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
    color: 'black',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#469c8f',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#469c8f',
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
});

export default SettingsScreen;
