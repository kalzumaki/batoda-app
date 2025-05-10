import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import BackButton from '../../components/BackButton';
import SearchAndFilter from '../../components/SearchAndFilter';
import {get} from '../../utils/proxy';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {TravelHistory} from '../../types/travel-history';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../types/passenger-dashboard';
type TravelHistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TravelHistoryDetail'
>; // Define navigation prop type

const TravelHistoryScreen: React.FC = () => {
  const navigation = useNavigation<TravelHistoryScreenNavigationProp>(); // Add navigation typing
  const [travelHistory, setTravelHistory] = useState<TravelHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchTravelHistory = async () => {
    setLoading(true);
    try {
      const response = await get(
        API_ENDPOINTS.DISPLAY_TRAVEL_HISTORY_PER_PASSENGER,
      );

      if (response?.status && Array.isArray(response?.travel_history)) {
        const data = response.travel_history;
        console.log('Data fetched successfully:', data); // Check what data we get
        setTravelHistory(data);
      } else {
        console.log('No valid travel history data found.');
        setTravelHistory([]);
      }
    } catch (error) {
      console.error('Error fetching travel history:', error);
      setTravelHistory([]);
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

  // Group travel history by date
  const groupByDate = (history: TravelHistory[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const groupedHistory: {[key: string]: TravelHistory[]} = {};

    history.forEach(item => {
      const itemDate = new Date(item.date);
      const itemDateStr = itemDate.toDateString();

      const todayStr = today.toDateString();
      const yesterdayStr = yesterday.toDateString();

      let groupKey = '';
      if (itemDateStr === todayStr) {
        groupKey = 'Today';
      } else if (itemDateStr === yesterdayStr) {
        groupKey = 'Yesterday';
      } else {
        groupKey = item.date;
      }

      if (!groupedHistory[groupKey]) {
        groupedHistory[groupKey] = [];
      }
      groupedHistory[groupKey].push(item);
    });

    return groupedHistory;
  };

  // Filtered history data
  const groupedHistory = groupByDate(travelHistory);
  const filteredHistory = Object.keys(groupedHistory).reduce(
    (acc: any[], groupKey) => {
      const filteredItems = groupedHistory[groupKey].filter(
        item =>
          (!selectedDate || item.date === selectedDate) &&
          item.tricycle_number.toString().includes(search),
      );

      if (filteredItems.length > 0) {
        acc.push({
          title: groupKey, // Title for each section (Today, Yesterday, etc.)
          data: filteredItems, // The items for each section
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
      </View>
    );
  }

  const renderItem = ({item}: {item: TravelHistory}) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TravelHistoryDetail', {item})} // Navigate with the selected item
      key={item.date + item.tricycle_number}
      style={[
        styles.itemContainer,
        item.status === 'cancelled'
          ? styles.cancelledItem
          : styles.transactionItem,
      ]}>
      <View style={styles.leftSection}>
        <Text style={styles.tricycleNumber}>{item.tricycle_number}</Text>
      </View>
      <View style={styles.middleSection}>
        {item.status === 'cancelled' ? (
          <Text style={styles.status}>Cancelled</Text>
        ) : (
          <Text style={styles.referenceNo}>Ref: {item.reference_no}</Text>
        )}
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.time}>{item.time}</Text>
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
      <SectionList
        sections={filteredHistory} // Data passed as sections
        keyExtractor={(item, index) =>
          `${item.date}-${item.tricycle_number}-${index}`
        }
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.noDataText}>No travel history found.</Text>
        }
      />
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
  transactionItem: {backgroundColor: '#62a287'},
  tricycleNumber: {fontSize: 20, fontWeight: 'bold', color: 'white'},
  referenceNo: {color: 'white', fontWeight: 'bold'},
  status: {color: 'white', fontWeight: 'bold'},
  time: {color: 'white'},
  leftSection: {flex: 1, alignItems: 'flex-start'},
  middleSection: {flex: 1, alignItems: 'center'},
  rightSection: {flex: 1, alignItems: 'flex-end'},
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
});

export default TravelHistoryScreen;
