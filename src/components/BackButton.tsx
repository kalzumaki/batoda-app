import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

type BackButtonProps = {
  onPress?: () => void;
};

const BackButton: React.FC<BackButtonProps> = ({ onPress }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress ? onPress : () => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#2d665f" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
});

export default BackButton;
