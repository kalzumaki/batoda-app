import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  RefreshTriggerProp,
  RootStackParamList,
} from '../../types/passenger-dashboard';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const {width, height} = Dimensions.get('window');

const FloatingNavigation: React.FC<RefreshTriggerProp> = ({refreshTrigger}) => {
  const navigation = useNavigation<NavigationProps>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({bottom: 1.0}); // Default position

  const toggleExpand = (event?: any) => {
    if (event) {
      const {pageY} = event.nativeEvent;
      setButtonPosition({bottom: height - pageY - 42.5}); // Adjust to center
    }
    setIsExpanded(!isExpanded);
  };

  const handleReserveRide = () => {
    setIsExpanded(false);
    navigation.navigate('ReserveRide');
  };

  const handleScanQR = () => {
    setIsExpanded(false);
    navigation.navigate('ScanQR');
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* Modal for expanded buttons */}
      <Modal
        transparent
        visible={isExpanded}
        animationType="fade"
        onRequestClose={() => toggleExpand()}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.expandedContainer, {bottom: buttonPosition.bottom}]}>
            <View style={styles.topButtons}>
              {/* Reserve Ride */}
              <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  style={styles.circleButton}
                  onPress={handleReserveRide}>
                  <Image
                    source={require('../../assets/5.png')}
                    style={styles.buttonImage}
                  />
                </TouchableOpacity>
                <Text style={styles.buttonText}>Reserve a ride</Text>
              </View>

              {/* Scan QR */}
              <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  style={styles.circleButton}
                  onPress={handleScanQR}>
                  <Image
                    source={require('../../assets/6.png')}
                    style={styles.buttonImage}
                  />
                </TouchableOpacity>
                <Text style={styles.buttonText}>Scan QR</Text>
              </View>
            </View>

            {/* BATODA Button (Inside Modal, Same Position) */}
            <TouchableOpacity
              style={styles.batodaButton}
              onPress={() => toggleExpand()}>
              <Text style={styles.batodaButtonText}>BATODA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating BATODA Button (Triggers Modal) */}
      {!isExpanded && (
        <TouchableOpacity
          style={[styles.mainButton, {bottom: buttonPosition.bottom}]}
          onPress={toggleExpand}>
          <Text style={styles.mainButtonText}>BATODA</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 20, // Keep BATODA button at the bottom
  },

  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%', // Ensures they stay aligned properly
    marginBottom: 50,
    paddingHorizontal: 40, // Adds spacing between buttons
  },
  buttonWrapper: {
    alignItems: 'center',
    marginHorizontal: 30, // Increase this value for more spacing
  },

  circleButton: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#2d665f',
    borderWidth: 2,
  },
  buttonImage: {
    width: 75,
    height: 40,
    resizeMode: 'contain',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    color: 'white',
  },
  /* BATODA Button */
  batodaButton: {
    width: 85,
    height: 85,
    backgroundColor: 'white',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#2d665f',
    borderWidth: 2,
  },
  batodaButtonText: {
    color: '#2d665f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  /* Floating BATODA Button */
  mainButton: {
    width: 85,
    height: 85,
    backgroundColor: '#2d665f',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    position: 'absolute',
    bottom: 1.0,
  },
  mainButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FloatingNavigation;
