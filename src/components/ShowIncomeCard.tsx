import React, {useState, useEffect, useCallback} from 'react';
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
import {IncomeResponse} from '../types/show-income';
import {RefreshTriggerProp} from '../types/passenger-dashboard';
import useSocketListener from '../hooks/useSocketListener';

const ShowIncomeCard: React.FC<RefreshTriggerProp> = ({refreshTrigger}) => {
  const [incomeData, setIncomeData] = useState<IncomeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const fetchIncome = async () => {
    try {
      const response = await get(API_ENDPOINTS.SHOW_INCOME);
      if (response.status) {
        setIncomeData(response);
      } else {
        console.log('Failed to fetch income:', response.message);
      }
    } catch (error) {
      console.log('Error fetching income:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchIncome();
  }, [refreshTrigger]);
  const handleNewIncome = useCallback((data: any) => {
    console.log('New Income:', data);
    fetchIncome();
  }, []);

  useSocketListener('dispatcher-paid', handleNewIncome);
  useSocketListener('seat-paid', handleNewIncome);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const todayGroup = incomeData?.history.find(group => group.date === 'Today');
  const otherGroups = incomeData?.history.filter(
    group => group.date !== 'Today',
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#62a287" />
      </View>
    );
  }
  if (!incomeData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noDataText}>Unable to load income data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!todayGroup ? (
        <Text style={styles.noDataText}>No income history for today.</Text>
      ) : (
        <TouchableOpacity style={styles.card} onPress={openModal}>
          <View style={styles.lottieContainer}>
            <LottieView
              source={require('../assets/income-animation.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.date}>{todayGroup.date}</Text>
            <Text style={styles.incomeLabel}>Daily Income</Text>
            <Text style={styles.incomeValue}>
              ₱
              {Number(todayGroup.total_income).toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>

            {incomeData?.monthly_income?.length > 0 && (
              <>
                <Text style={[styles.incomeLabel, {marginTop: 8}]}>
                  Monthly Income
                </Text>
                <Text style={styles.incomeValue}>
                  ₱
                  {parseFloat(
                    incomeData.monthly_income[0].total_income,
                  ).toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
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
                <Text style={styles.modalTitle}>Past Income History</Text>
                <FlatList
                  data={otherGroups}
                  keyExtractor={item => item.date}
                  renderItem={({item}) => (
                    <>
                      <Text style={styles.modalSubTitle}>
                        {item.date} Transactions
                      </Text>

                      <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderText}>Amount</Text>
                        <Text style={styles.tableHeaderText}>Dispatch ID</Text>
                      </View>

                      {item.transactions.length === 0 ? (
                        <Text style={{textAlign: 'center', padding: 8}}>
                          No transactions
                        </Text>
                      ) : (
                        item.transactions.map((tx, index) => (
                          <View
                            key={tx.id}
                            style={[
                              styles.transactionRow,
                              index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                            ]}>
                            <Text style={styles.transactionCell}>
                              ₱{parseFloat(tx.amount).toLocaleString()}
                            </Text>
                            <Text style={styles.transactionCell}>
                              {tx.dispatch_id}
                            </Text>
                          </View>
                        ))
                      )}
                    </>
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{paddingBottom: 20}}
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
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSubTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d5554',
    marginTop: 16,
    marginBottom: 8,
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
