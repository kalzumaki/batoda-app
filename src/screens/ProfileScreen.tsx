import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/passenger-dashboard';
import BackButton from '../components/BackButton';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();

  const profileData = {
    firstName: 'Van',
    lastName: 'Beethoven',
    gender: 'Male',
    age: '51',
    birthdate: 'September 29, 1973',
  };

  const handleEdit = (field: string, value: string) => {
    navigation.navigate('EditProfile', {field, value});
  };

  const renderEditableField = (label: string, value: string, field: string) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.value}>{value}</Text>
        <TouchableOpacity onPress={() => handleEdit(field, value)}>
          <Icon name="pencil-outline" size={20} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with BackButton and Title */}
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.editProfileText}>Edit Profile</Text>
      </View>

      {/* Space between header and profile */}
      <View style={styles.spacer} />

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image
            source={require('../assets/24.png')}
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.profileName}>
          {profileData.firstName} {profileData.lastName}
        </Text>
      </View>

      {/* Profile Fields */}
      {renderEditableField('First Name', profileData.firstName, 'firstName')}
      {renderEditableField('Last Name', profileData.lastName, 'lastName')}
      {renderEditableField('Gender', profileData.gender, 'gender')}
      {renderEditableField('Age', profileData.age, 'age')}
      {renderEditableField('Birthdate', profileData.birthdate, 'birthdate')}
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
    justifyContent: 'center',
    marginBottom: 20,
  },
  editProfileText: {
    fontSize: 20,
    // fontWeight: 'bold',
    marginLeft: 10,
    color: 'black',
  },
  spacer: {
    height: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#469c8f',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#469c8f',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#469c8f',
    paddingVertical: 8,
  },
  value: {
    fontSize: 16,
    color: 'black',
  },
});

export default ProfileScreen;
