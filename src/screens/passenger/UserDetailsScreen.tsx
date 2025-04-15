import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {RootStackParamList} from '../../types/passenger-dashboard';
import {API_URL, STORAGE_API_URL} from '@env';

type UserDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'UserDetailsScreen'
>;

const UserDetailsScreen: React.FC = () => {
  const route = useRoute<UserDetailsScreenRouteProp>();
  const navigation = useNavigation();
  const {user} = route.params;
  const [profileImage, setProfileImage] = useState(
    STORAGE_API_URL + '/storage/' + user.profile,
  );
  useEffect(() => {
    console.log('Profile Image URL: ', profileImage);
  }, [profileImage]);
  return (
    <View style={styles.container}>
      {/* Background Curve */}
      <View style={styles.headerBackground}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Profile Image */}
        <View style={styles.profileContainer}>
          {user.profile ? (
            <Image
              source={{uri: profileImage}}
              style={styles.profileImage}
              onError={() => {
                console.warn('Failed to load image, using fallback.');
                setProfileImage(require('../../assets/24.png'));
              }}
            />
          ) : (
            <Icon name="person-circle" size={100} color="#ccc" />
          )}
        </View>

        {/* Name & Role */}
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>

        {/* Tricycle Number */}
        <View style={styles.tricycleNumber}>
          <Text style={styles.tricycleText}>{user.tricycle}</Text>
          <Text style={styles.tricycleLabel}>Tricycle No.</Text>
        </View>
      </View>

      {/* User Details Section */}
      <View style={styles.detailsContainer}>
        <Text style={styles.detailTitle}>Gender:</Text>
        <Text style={styles.detailText}>{user.gender.toUpperCase()}</Text>

        <Text style={styles.detailTitle}>Age:</Text>
        <Text style={styles.detailText}>{user.age}</Text>

        <Text style={styles.detailTitle}>Address:</Text>
        <Text style={styles.detailText}>{user.address}</Text>

        <Text style={styles.sectionTitle}>Contact Info</Text>

        <Text style={styles.detailTitle}>Email:</Text>
        <Text style={styles.detailText}>{user.email}</Text>

        <Text style={styles.detailTitle}>Contact No.:</Text>
        <Text style={styles.detailText}>{user.mobile}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBackground: {
    backgroundColor: '#2d665f',
    height: 250,
    borderBottomLeftRadius: 140,
    borderBottomRightRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 50,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
  },
  profileContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  role: {
    fontSize: 16,
    color: 'white',
  },
  tricycleNumber: {
    position: 'absolute',
    right: 30,
    top: 190,
    backgroundColor: '#469c8f',
    padding: 10,
    borderRadius: 50,
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  tricycleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  tricycleLabel: {
    fontSize: 12,
    color: 'white',
  },
  detailsContainer: {
    padding: 30,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E6F56',
    marginTop: 20,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#555',
  },
});

export default UserDetailsScreen;
