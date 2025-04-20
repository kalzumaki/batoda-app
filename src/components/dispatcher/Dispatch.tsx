import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {RefreshTriggerProp} from '../../types/passenger-dashboard';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {get} from '../../utils/proxy';
import {PendingDispatch} from '../../types/pending-dispatch';
import {STORAGE_API_URL} from '@env';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const DispatchCard: React.FC<RefreshTriggerProp> = ({refreshTrigger}) => {
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [dispatches, setDispatches] = useState<PendingDispatch[]>([]);

  useEffect(() => {
    fetchDispatches();
  }, [refreshTrigger]);

  const fetchDispatches = async () => {
    try {
      const res = await get(API_ENDPOINTS.GET_PENDING_DISPATCHES);
      if (res.status && res.dispatches) {
        setDispatches(res.dispatches);
      }
    } catch (error) {
      console.error('Failed to fetch dispatches:', error);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const RenderItem = ({item}: {item: PendingDispatch}) => {
    const [imageError, setImageError] = useState(false);
    const fullName = `${item.driver.fname} ${item.driver.lname}`;
    const profileImage = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
      fullName,
    )}`;
    const createdAt = dayjs(item.created_at).fromNow(); // <-- Here
    const isSelected = selectedIds.includes(item.id);

    const driverProfileImage = item.driver.profile
      ? {uri: `${STORAGE_API_URL}/storage/${item.driver.profile}`}
      : {uri: profileImage};

    return (
      <View style={styles.card}>
        {multiSelectEnabled && (
          <CheckBox
            value={isSelected}
            onValueChange={() => toggleSelect(item.id)}
          />
        )}
        <View style={styles.infoContainer}>
          <Image
            source={
              !imageError && driverProfileImage.uri.startsWith('http')
                ? driverProfileImage
                : require('../../assets/25.png')
            }
            onError={() => setImageError(true)}
            style={styles.profileIcon}
          />
          <View>
            <Text style={styles.infoText}>
              TRICYCLE NO.: {item.tricycle.tricycle_number}
            </Text>
            <Text style={styles.infoText}>NAME: {fullName}</Text>
            <Text style={styles.timeText}>Requested {createdAt}</Text>

            {/* <-- Here */}
          </View>
        </View>
        {!multiSelectEnabled && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, {backgroundColor: 'green'}]}>
              <FontAwesomeIcon name="check" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, {backgroundColor: 'red'}]}>
              <FontAwesomeIcon name="times" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const handleApproveAll = () => {
    console.log('Approved IDs:', selectedIds);
    // Add logic here
  };

  const handleRejectAll = () => {
    console.log('Rejected IDs:', selectedIds);
    // Add logic here
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>PENDING REQUEST</Text>
      <View style={styles.multiRow}>
        <Text style={styles.multiLabel}>MULTI SELECT:</Text>
        <Switch
          value={multiSelectEnabled}
          onValueChange={setMultiSelectEnabled}
          trackColor={{false: '#ccc', true: '#2d8c7f'}}
          thumbColor={multiSelectEnabled ? '#fff' : '#f4f3f4'}
        />
      </View>

      <FlatList
        data={dispatches}
        renderItem={({item}) => <RenderItem item={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{paddingBottom: 20}}
      />

      {multiSelectEnabled && (
        <View style={styles.multiActions}>
          <TouchableOpacity
            onPress={handleApproveAll}
            style={[styles.multiBtn, {backgroundColor: 'green'}]}>
            <FontAwesomeIcon name="check" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRejectAll}
            style={[styles.multiBtn, {backgroundColor: 'red'}]}>
            <FontAwesomeIcon name="times" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: '#2d665f',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  multiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  multiLabel: {
    fontSize: 14,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d8c7f',
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  multiActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  multiBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  timeText: {
    color: '#d0f0ec',
    fontSize: 12,
    marginTop: 2,
  },
});

export default DispatchCard;
