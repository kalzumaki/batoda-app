import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SectionList,
  RefreshControl,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {get} from '../../utils/proxy';
import BackButton from '../../components/BackButton';
import SearchAndFilter from '../../components/SearchAndFilter';
import {DriverTravelHistoryResponse} from '../../types/travel-history';

const TravelHistoryForDrivers = () => {
  const [travelData, setTravelData] = useState<
    DriverTravelHistoryResponse['data']
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState<
    DriverTravelHistoryResponse['data'][0]['reservations'] | null
  >(null);

  const fetchTravelHistory = async () => {
    setLoading(true);
    try {
      const response = await get(API_ENDPOINTS.GET_DRIVERS_TRAVEL_HISTORY);
      setTravelData(response.data);
    } catch (error) {
      console.error('Failed to fetch travel history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTravelHistory().finally(() => setRefreshing(false));
  };

  const handleSearch = (text: string) => setSearch(text);
  const handleDateSelected = (date: string) => setSelectedDate(date);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const groupByDate = (data: DriverTravelHistoryResponse['data']) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const grouped: {[key: string]: typeof data} = {};

    data.forEach(item => {
      const itemDate = new Date(item.created_at.raw);

      const itemDateStr = itemDate.toDateString();

      const todayStr = today.toDateString();
      const yesterdayStr = yesterday.toDateString();

      let groupKey = '';
      if (itemDateStr === todayStr) {
        groupKey = 'Today';
      } else if (itemDateStr === yesterdayStr) {
        groupKey = 'Yesterday';
      } else {
        groupKey = item.created_at.date;
      }

      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(item);
    });

    return grouped;
  };

  const groupedHistory = groupByDate(travelData);

  const filteredHistory = Object.keys(groupedHistory).reduce(
    (acc: any[], groupKey) => {
      const filteredItems = groupedHistory[groupKey].filter(item => {
        const itemDateStr = item.created_at.raw.split('T')[0];
        return (
          (!selectedDate || itemDateStr === selectedDate) &&
          item.dispatch_id.toString().includes(search)
        );
      });

      if (filteredItems.length > 0) {
        acc.push({
          title: groupKey,
          data: filteredItems,
        });
      }

      return acc;
    },
    [],
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#469c8f" />
        <Text style={styles.noDataText}>Loading travel history...</Text>
      </View>
    );
  }

  const renderItem = ({item}: any) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedReservations(item.reservations);
        setModalVisible(true);
      }}
      activeOpacity={0.8}
      style={[
        styles.itemContainer,
        item.status === 'rejected' && styles.cancelledItem,
      ]}>
      <Text style={styles.timeHeader}>Time: {item.created_at.time}</Text>
      <View style={styles.leftSection}>
        <Text style={styles.status}>
          Status: {getStatusDisplay(item.status)}
        </Text>
        <Text style={styles.referenceNo}>Dispatch ID: {item.dispatch_id}</Text>
        <Text style={styles.time}>Passenger Count: {item.passenger_count}</Text>
        <Text style={styles.time}>Dispatcher: {item.dispatcher.full_name}</Text>

        {item.scheduled_dispatch_time ? (
          <Text style={styles.time}>
            Scheduled Time: {item.scheduled_dispatch_time.date}{' '}
            {item.scheduled_dispatch_time.time}
          </Text>
        ) : (
          <Text style={styles.time}>Scheduled Time: Not Available</Text>
        )}

        {item.actual_dispatch_time ? (
          <Text style={styles.time}>
            Actual Time: {item.actual_dispatch_time.date}{' '}
            {item.actual_dispatch_time.time}
          </Text>
        ) : (
          <Text style={styles.time}>Actual Time: Not Available</Text>
        )}

        <Text style={styles.time}>
          Reservations: {item.reservations.length}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({section}: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.headerText}>{section.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <BackButton />
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Travel History</Text>
      </View>
      <SearchAndFilter
        onSearchChange={handleSearch}
        onDateSelected={handleDateSelected}
      />
      {filteredHistory.length > 0 ? (
        <SectionList
          sections={filteredHistory}
          keyExtractor={(item, index) =>
            `${item.dispatch_id}-${item.date}-${index}`
          }
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.noDataText}>No travel history available.</Text>
        </View>
      )}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedReservations && selectedReservations.length > 0 ? (
                <Text style={styles.modalTitle}>Reservations</Text>
              ) : null}
              <ScrollView contentContainerStyle={styles.scrollContent}>
                {selectedReservations && selectedReservations.length > 0 ? (
                  selectedReservations.map((res, index) => (
                    <View key={index} style={styles.reservationItem}>
                      <Text style={styles.modalText}>
                        <Text style={styles.boldText}>Reservation ID:</Text>{' '}
                        {res.reservation_id}
                      </Text>
                      <Text style={styles.modalText}>
                        <Text style={styles.boldText}>Passenger:</Text>{' '}
                        {res.passenger}
                      </Text>
                      {/* <Text style={styles.modalText}>
                        <Text style={styles.boldText}>Expire At:</Text>{' '}
                        {res.expire_at}
                      </Text> */}
                      <Text style={styles.modalText}>
                        <Text style={styles.boldText}>Seat Positions:</Text>
                      </Text>
                      {Array.isArray(res.seat_positions) &&
                      res.seat_positions.length > 0 ? (
                        res.seat_positions.map((seat, idx) => (
                          <Text key={idx} style={styles.seatText}>
                            •{' '}
                            {seat
                              .replace(/_/g, ' ')
                              .split(' ')
                              .map(
                                word =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(' ')}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.modalText}>
                          No seat positions available.
                        </Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.modalText}>
                    No reservations available.
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f8f8', padding: 20},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    flex: 1,
  },
  itemContainer: {
    backgroundColor: '#62a287',
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  cancelledItem: {backgroundColor: '#d9534f'},
  status: {color: 'white', fontWeight: 'bold'},
  referenceNo: {color: 'white', fontWeight: 'bold'},
  time: {color: 'white'},
  leftSection: {flex: 1, alignItems: 'flex-start'},
  timeHeader: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10, // Adjust spacing for the time display
  },
  noDataText: {fontSize: 18, color: 'gray', textAlign: 'center', marginTop: 20},
  sectionHeader: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15, // Rounded corners for a smoother look
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000', // Adds shadow for depth
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Android shadow effect
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333', // Darker title for better contrast
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#444', // Slightly lighter text for better readability

  },
  boldText: {
    fontWeight: 'bold',
    color: '#000', // Strong color for headers in the modal
  },
  reservationItem: {
    backgroundColor: '#f0f0f0', // Lighter background to distinguish reservations
    padding: 15,
    marginBottom: 15,
    borderRadius: 10, // Soft corners for each item
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  seatText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
    marginLeft: 10, // Slight indent to make the bullet list clear
  },
  scrollContent: {
    paddingBottom: 20, // Ensures there’s some padding at the bottom of the scroll view
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#469c8f', // Subtle color for the close button
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TravelHistoryForDrivers;
