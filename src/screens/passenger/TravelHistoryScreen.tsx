import React, { useState, useEffect } from 'react';
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

interface TravelData {
  id: string;
  tricycleNumber: string;
  amount: string;
  time: string;
  date: string;
}

const TravelHistoryScreen: React.FC = () => {
  const [travelData, setTravelData] = useState<TravelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Simulated data fetch
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setTravelData([
        {
          id: '1',
          tricycleNumber: '123',
          amount: '₱20.00',
          time: '8:30 AM',
          date: '2024-10-17',
        },
        {
          id: '2',
          tricycleNumber: '456',
          amount: '₱30.00',
          time: '9:00 AM',
          date: '2024-10-16',
        },
        {
          id: '3',
          tricycleNumber: '789',
          amount: '₱25.00',
          time: '9:30 AM',
          date: '2024-10-17',
        },
      ]);
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
    setRefreshing(false);
  };

  const handleSearch = (text: string) => setSearch(text);
  const handleDateSelected = (date: string) => setSelectedDate(date);

  const filteredData = travelData.filter((item) =>
    item.tricycleNumber.includes(search) &&
    (!selectedDate || item.date === selectedDate)
  );

  const renderItem = ({ item }: { item: TravelData }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <View style={styles.card}>
        <Text style={styles.number}>{item.tricycleNumber}</Text>
      </View>
      <Text style={styles.amount}>{item.amount}</Text>
      <Text style={styles.time}>{item.time}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#469c8f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <BackButton />
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Travel History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search and Date Filter */}
      <SearchAndFilter
        onSearchChange={handleSearch}
        onDateSelected={handleDateSelected}
      />

      {/* Travel List with Refresh */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  number: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  amount: {
    color: 'white',
    fontWeight: 'bold',
  },
  time: {
    color: 'white',
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    color: 'white',
  },
});

export default TravelHistoryScreen;
