import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Text,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_ENDPOINTS } from '../../api/api-endpoints';
import { get } from '../../utils/proxy';
import { ReceiptProps } from '../../types/ticket';

const ReceiptDownloader: React.FC<ReceiptProps> = ({ dispatchId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFetchReceipt = async () => {
    setLoading(true);
    setError(null);
    setImageUrl(null); // Reset previous image

    try {
      const url = `${API_ENDPOINTS.DISPLAY_RECEIPT}?dispatch_id=${dispatchId}`;
      const response = await get(url);

      if (response?.transactions?.length > 0) {
        const foundImageUrl: string = response.transactions[0].receipt_image; // ✅ Ensure API returns an image URL

        if (!foundImageUrl) {
          setError('No receipt image found.');
          return;
        }

        console.log('✅ Receipt image URL:', foundImageUrl);
        setImageUrl(foundImageUrl); // ✅ Set the image URL to display it
      } else {
        setError('Receipt not found.');
      }
    } catch (err) {
      setError('Failed to fetch receipt.');
      console.error('❌ Error fetching receipt:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.downloadButton} onPress={handleFetchReceipt}>
        <Icon name="file-download" size={24} color="green" />
      </TouchableOpacity>

      {loading && <ActivityIndicator size="small" color="blue" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* ✅ Display the receipt image if available */}
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.receiptImage} resizeMode="contain" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  downloadButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  receiptImage: {
    width: 300,  // Adjust based on design
    height: 400, // Adjust based on design
    marginTop: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
});

export default ReceiptDownloader;
