import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import BackButton from '../../components/BackButton';
import SearchAndFilter from '../../components/SearchAndFilter';
import {get} from '../../utils/proxy';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {Transaction, CancelledTicket} from '../../types/travel-history';

type TravelHistoryItem = Transaction | CancelledTicket;

type GroupedHistory = {
  date: string;
  items: TravelHistoryItem[];
};

const isTransaction = (item: TravelHistoryItem): item is Transaction =>
  'transaction_id' in item;
const isCancelledTicket = (item: TravelHistoryItem): item is CancelledTicket =>
  'ticket_id' in item;

const TravelHistoryScreen: React.FC = () => {
  const [groupedHistory, setGroupedHistory] = useState<GroupedHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchTravelHistory = async () => {
    setLoading(true);
    try {
      const transactionsResponse = await get(
        API_ENDPOINTS.DISPLAY_TRANSACTIONS_PER_USER,
      );
      const cancelledTicketsResponse = await get(
        API_ENDPOINTS.DISPLAY_CANCELLED_TICKETS_PER_USER,
      );

      const transactions: Transaction[] = transactionsResponse.status
        ? transactionsResponse.transactions
        : [];
      const cancelledTickets: CancelledTicket[] =
        cancelledTicketsResponse.status
          ? cancelledTicketsResponse.cancelled_tickets
          : [];

      const combinedHistory: TravelHistoryItem[] = [
        ...transactions,
        ...cancelledTickets,
      ].sort((a, b) => b.time.localeCompare(a.time));

      const grouped = combinedHistory.reduce((acc: GroupedHistory[], item) => {
        const dateGroup = acc.find(group => group.date === item.date);
        if (dateGroup) {
          dateGroup.items.push(item);
        } else {
          acc.push({date: item.date, items: [item]});
        }
        return acc;
      }, []);

      setGroupedHistory(grouped);
    } catch (error) {
      console.error('Error fetching travel history:', error);
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

  const filteredHistory = groupedHistory
    .filter(({date}) => !selectedDate || date === selectedDate)
    .map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.tricycle_number.toString().includes(search),
      ),
    }))
    .filter(group => group.items.length > 0);

  const renderItem = ({item}: {item: TravelHistoryItem}) => {
    const containerStyle = [
      styles.itemContainer,
      isTransaction(item) ? styles.transactionItem : styles.cancelledItem,
    ];

    return (
      <TouchableOpacity style={containerStyle}>
        <View style={styles.leftSection}>
          <Text style={styles.tricycleNumber}>{item.tricycle_number}</Text>
        </View>
        <View style={styles.middleSection}>
          {isTransaction(item) ? (
            <Text style={styles.amount}>₱{item.amount}</Text>
          ) : (
            <Text style={styles.status}>Cancelled</Text>
          )}
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#469c8f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Travel History</Text>
        <View style={{width: 24}} />
      </View>
      <SearchAndFilter
        onSearchChange={handleSearch}
        onDateSelected={handleDateSelected}
      />
      {filteredHistory.length === 0 ? (
        <Text style={styles.noDataText}>No travel history found.</Text>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={item => item.date}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({item}) => (
            <View>
              <Text style={styles.date}>{item.date}</Text>
              {item.items.map(historyItem => (
                <View
                  key={
                    'ticket_id' in historyItem
                      ? String((historyItem as CancelledTicket).ticket_id)
                      : String((historyItem as Transaction).transaction_id)
                  }>
                  {renderItem({item: historyItem})}
                </View>
              ))}
            </View>
          )}
        />
      )}
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
  date: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#469c8f',
    marginVertical: 10,
  },
  itemContainer: {
    backgroundColor: '#62a287',
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  cancelledItem: {backgroundColor: '#d9534f'},
  number: {fontSize: 20, fontWeight: 'bold', color: 'white'},
  amount: {color: 'white', fontWeight: 'bold'},
  status: {color: 'white', fontWeight: 'bold'},
  time: {color: 'white'},
  card: {alignItems: 'center', justifyContent: 'center'},
  label: {fontSize: 9, color: 'white'},
  transactionItem: {backgroundColor: '#62a287'},
  leftSection: {flex: 1, alignItems: 'flex-start'},
  middleSection: {flex: 1, alignItems: 'center'},
  rightSection: {flex: 1, alignItems: 'flex-end'},
  tricycleNumber: {fontSize: 20, fontWeight: 'bold', color: 'white'},
  noDataText: {fontSize: 18, color: 'gray', textAlign: 'center', marginTop: 20},
});

export default TravelHistoryScreen;
