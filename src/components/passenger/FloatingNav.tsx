import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/passenger-dashboard';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const FloatingNavigation: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleReserveRide = () => {
    navigation.navigate('ReserveRide');
  };

  const handleScanQR = () => {
    navigation.navigate('ScanQR');
  };

  return (
    <View style={styles.wrapper}>
      {/* Black Overlay when expanded */}
      {isExpanded && <View style={styles.blackOverlay} />}

      {/* Expanded Buttons */}
      {isExpanded && (
        <View style={styles.expandedContainer}>
          <TouchableOpacity
            style={[styles.circleButton, styles.focusedButton]}
            onPress={handleReserveRide}
          >
            <Text style={[styles.buttonText, styles.focusedButtonText]}>Reserve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.circleButton, styles.focusedButton]}
            onPress={handleScanQR}
          >
            <Text style={[styles.buttonText, styles.focusedButtonText]}>Scan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main floating button */}
      <TouchableOpacity
        style={[
          styles.mainButton,
          isExpanded && styles.mainButtonFocused,
        ]}
        onPress={toggleExpand}
      >
        <Text
          style={[styles.mainButtonText, isExpanded && styles.mainButtonTextFocused]}
        >
          BATODA
        </Text>
      </TouchableOpacity>
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
  blackOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1,
  },
  mainButton: {
    width: 85,
    height: 85,
    marginBottom: 69,
    backgroundColor: '#2d665f',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  mainButtonFocused: {
    backgroundColor: 'white',
    borderColor: '#2d665f',
    borderWidth: 2,
  },
  mainButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mainButtonTextFocused: {
    color: '#2d665f',
  },
  expandedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 100,
    width: '60%',
    zIndex: 2,
  },
  circleButton: {
    width: 70,
    height: 70,
    backgroundColor: '#2d665f',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedButton: {
    backgroundColor: 'white',
    borderColor: '#2d665f',
    borderWidth: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  focusedButtonText: {
    color: '#2d665f',
  },
});

export default FloatingNavigation;
