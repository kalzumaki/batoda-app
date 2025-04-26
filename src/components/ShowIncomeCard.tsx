import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {get} from '../utils/proxy';
import {API_ENDPOINTS} from '../api/api-endpoints';
import {IncomeGroup} from '../types/show-income';
import {RefreshTriggerProp} from '../types/passenger-dashboard';

const ShowIncomeCard: React.FC<RefreshTriggerProp> = ({refreshTrigger}) => {
  const [incomeData, setIncomeData] = useState<IncomeGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<IncomeGroup | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const response = await get(API_ENDPOINTS.SHOW_INCOME);
        if (response.status) {
          setIncomeData(response.history);
        } else {
          console.error('Failed to fetch income:', response.message);
        }
      } catch (error) {
        console.error('Error fetching income:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, [refreshTrigger]);

  const openModal = (group: IncomeGroup) => {
    setSelectedGroup(group);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedGroup(null);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#62a287" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {incomeData.length === 0 ? (
        <Text style={styles.noDataText}>No income history found.</Text>
      ) : (
        <FlatList
          data={incomeData}
          keyExtractor={item => item.date}
          renderItem={({item: group}) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => openModal(group)}>
              {/* Lottie Animation */}
              <View style={styles.lottieContainer}>
                <LottieView
                  source={require('../assets/income-animation.json')}
                  autoPlay
                  loop
                  style={styles.lottie}
                />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.date}>{group.date}</Text>
                <Text style={styles.incomeLabel}>Daily Income</Text>
                <Text style={styles.incomeValue}>
                  ₱{group.total_income.toLocaleString()}
                </Text>

                {group.monthly_income && group.monthly_income.length > 0 && (
                  <>
                    <Text style={[styles.incomeLabel, {marginTop: 8}]}>
                      Monthly Income
                    </Text>
                    <Text style={styles.incomeValue}>
                      ₱
                      {parseFloat(
                        group.monthly_income[0]?.total_income,
                      ).toLocaleString()}
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{paddingBottom: 20}}
        />
      )}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {selectedGroup?.date} Transactions
                </Text>

                {selectedGroup?.monthly_income &&
                  selectedGroup.monthly_income.length > 0 && (
                    <Text style={styles.modalIncome}>
                      Monthly Income: ₱
                      {parseFloat(
                        selectedGroup.monthly_income[0]?.total_income,
                      ).toLocaleString()}
                    </Text>
                  )}

                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Amount</Text>
                  <Text style={styles.tableHeaderText}>Dispatch ID</Text>
                </View>

                <FlatList
                  data={selectedGroup?.transactions}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({item, index}) => (
                    <View
                      style={[
                        styles.transactionRow,
                        index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                      ]}>
                      <Text style={styles.transactionCell}>
                        ₱{parseFloat(item.amount).toLocaleString()}
                      </Text>
                      <Text style={styles.transactionCell}>
                        {item.dispatch_id}
                      </Text>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{paddingBottom: 20}}
                  style={{flexGrow: 0}}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default ShowIncomeCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3d5554',
  },
  noDataText: {
    color: '#3d5554',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    flexDirection: 'row',
    alignItems: 'center',
  },
  lottieContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d5554',
    marginBottom: 8,
  },
  incomeLabel: {
    fontSize: 14,
    color: '#6b6b6b',
  },
  incomeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#469c8f',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3d5554',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalIncome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#469c8f',
    marginBottom: 16,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#3d5554',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  transactionCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#3d5554',
  },
  rowEven: {
    backgroundColor: '#f0f0f0',
  },
  rowOdd: {
    backgroundColor: '#ffffff',
  },
});
