import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {get} from '../../utils/proxy';
import {ReceiptProps} from '../../types/ticket';

const ReceiptDownloader: React.FC<ReceiptProps> = ({dispatchId}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleFetchReceipt = async () => {
    setLoading(true);
    setError(null);
    setReceiptData(null);

    try {
      const url = `${API_ENDPOINTS.DISPLAY_RECEIPT}?dispatch_id=${dispatchId}`;
      const response = await get(url);

      if (response?.transactions?.length > 0) {
        const transaction = response.transactions[0];
        const receipt = transaction.receipt;

        if (!receipt) {
          setError('No receipt found.');
          return;
        }

        console.log('✅ Receipt data:', receipt);
        setReceiptData({
          ...receipt,
          date: transaction.date, // Separate date field
          time: transaction.time, // Separate time field
        });
        setIsModalVisible(true); // ✅ Show modal after fetching receipt
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

  const formatSeatName = (seat: string) => {
    return seat
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={handleFetchReceipt}>
        <Icon name="receipt" size={24} color="green" />
      </TouchableOpacity>

      {loading && <ActivityIndicator size="small" color="blue" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        swipeDirection={['down']}
        onSwipeComplete={() => setIsModalVisible(false)}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.4}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Receipt Details</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Icon name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {receiptData ? (
            <View style={styles.receiptContainer}>
              <Text style={styles.receiptText}>
                <Text style={styles.text}>Date: </Text>
                <Text>
                  {new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }).format(new Date(receiptData.date))}
                </Text>
              </Text>
              <Text style={styles.receiptText}>
                <Text style={styles.text}>Time:</Text> {receiptData.time}
              </Text>
              <Text style={styles.receiptText}>
                <Text style={styles.text}>Driver:</Text> {receiptData.driver}
              </Text>
              <Text style={styles.receiptText}>
                <Text style={styles.text}>Passenger:</Text>{' '}
                {receiptData.passenger}
              </Text>
              <Text style={styles.receiptText}>
                <Text style={styles.text}>Total Cost: ₱</Text>
                {receiptData.total_cost}
              </Text>
              {receiptData.seats_reserved.length > 0 ? (
                <View>
                  <Text style={styles.text}>Seats Reserved:</Text>
                  <View style={styles.receiptContainer}>
                    {receiptData.seats_reserved
                      .map(formatSeatName)
                      .sort()
                      .map((seat: any, index: any) => (
                        <Text key={index} style={styles.receiptText}>
                          • {formatSeatName(seat)}
                        </Text>
                      ))}
                  </View>
                </View>
              ) : (
                <Text style={styles.receiptText}>Seats Reserved: None</Text>
              )}
            </View>
          ) : (
            <Text style={[styles.receiptText, {textAlign: 'center'}]}>
              No receipt data available.
            </Text>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 16,
  },
  downloadButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  receiptContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  receiptText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
  },
});

export default ReceiptDownloader;
