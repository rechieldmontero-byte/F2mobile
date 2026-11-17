import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { supabase } from '../lib/supabase';
import { showAlert } from '../utils/alert';

const TABS = ['Supply', 'Group Buying', 'Fulfillment', 'Auction'];

export default function ActivityScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState(route.params?.tab || 'Supply');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (activeTab) {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData([]);
        return;
      }

      let query;
      switch (activeTab) {
        case 'Supply':
          query = supabase.from('products').select('*');
          if (filterCategory !== 'all') {
            query = query.eq('category', filterCategory);
          }
          query = query.order('created_at', { ascending: false }).limit(10);
          break;
        case 'Group Buying':
          query = supabase.from('group_buying').select('*');
          if (filterStatus !== 'all') {
            query = query.eq('status', filterStatus);
          }
          query = query.order('created_at', { ascending: false });
          break;
        case 'Fulfillment':
          query = supabase.from('deliveries').select('*, orders(*)');
          if (filterStatus !== 'all') {
            query = query.eq('status', filterStatus);
          }
          query = query.order('created_at', { ascending: false });
          break;
        case 'Auction':
          query = supabase.from('auctions').select('*');
          if (filterStatus !== 'all') {
            query = query.eq('status', filterStatus);
          }
          query = query.order('end_time', { ascending: true });
          break;
        default:
          setData([]);
          return;
      }

      const { data: result, error } = await query;
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderSupplyItem = (item) => (
    <View key={item.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardQty}>{item.quantity}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Price</Text>
        <Text style={styles.cardValue}>₱{parseFloat(item.price || 0).toLocaleString()}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Category</Text>
        <Text style={styles.cardTime}>{item.category}</Text>
      </View>
    </View>
  );

  const renderGroupBuyingItem = (item) => (
    <View key={item.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{item.title}</Text>
        <Text style={styles.cardQty}>{item.current_quantity}/{item.target_quantity}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Unit Price</Text>
        <Text style={styles.cardValue}>₱{parseFloat(item.unit_price || 0).toLocaleString()}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Target Price</Text>
        <Text style={styles.cardValue}>₱{parseFloat(item.target_price || 0).toLocaleString()}</Text>
      </View>
      <View style={styles.offersRow}>
        <Text style={styles.offersLabel}>Status</Text>
        <Text style={styles.offersCount}>{item.status}</Text>
      </View>
    </View>
  );

  const renderFulfillmentItem = (item) => (
    <View key={item.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>Order #{item.order_id?.slice(0, 8)}</Text>
        <Text style={styles.cardQty}>{item.status}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Carrier</Text>
        <Text style={styles.cardValue}>{item.carrier || 'TBD'}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Tracking</Text>
        <Text style={styles.cardTime}>{item.tracking_number || 'Pending'}</Text>
      </View>
      {item.estimated_delivery && (
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Est. Delivery</Text>
          <Text style={styles.cardValue}>{new Date(item.estimated_delivery).toLocaleDateString()}</Text>
        </View>
      )}
    </View>
  );

  const renderAuctionItem = (item) => (
    <View key={item.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{item.title}</Text>
        <Text style={styles.cardQty}>{item.status}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Current Bid</Text>
        <Text style={styles.cardValue}>₱{parseFloat(item.current_bid || item.starting_bid || 0).toLocaleString()}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Starting Bid</Text>
        <Text style={styles.cardValue}>₱{parseFloat(item.starting_bid || 0).toLocaleString()}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Ends At</Text>
        <Text style={styles.cardTime}>{new Date(item.end_time).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.replace('Home')} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.logoSmall}>
            <Image source={require('../assets/logo.png')} style={styles.logoSmallImage} resizeMode="contain" />
          </View>
          <Text style={styles.headerTitle}>Activity</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search...</Text>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2e7d32']} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2e7d32" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No {activeTab} items</Text>
            <Text style={styles.emptySubtitle}>Items will appear here</Text>
          </View>
        ) : (
          <>
            {activeTab === 'Supply' && data.map(renderSupplyItem)}
            {activeTab === 'Group Buying' && data.map(renderGroupBuyingItem)}
            {activeTab === 'Fulfillment' && data.map(renderFulfillmentItem)}
            {activeTab === 'Auction' && data.map(renderAuctionItem)}
          </>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter {activeTab}</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'Supply' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Category</Text>
                {['all', 'fruits', 'veggies', 'meats', 'dairy'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterOption, filterCategory === cat && styles.filterOptionActive]}
                    onPress={() => { setFilterCategory(cat); fetchData(); setFilterModalVisible(false); }}
                  >
                    <Text style={[styles.filterOptionText, filterCategory === cat && styles.filterOptionTextActive]}>
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab !== 'Supply' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Status</Text>
                {['all', 'open', 'active', 'pending', 'completed', 'closed'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.filterOption, filterStatus === status && styles.filterOptionActive]}
                    onPress={() => { setFilterStatus(status); fetchData(); setFilterModalVisible(false); }}
                  >
                    <Text style={[styles.filterOptionText, filterStatus === status && styles.filterOptionTextActive]}>
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setFilterCategory('all');
                setFilterStatus('all');
                fetchData();
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  backText: {
    fontSize: 28,
    color: '#1b5e20',
    fontWeight: 'bold',
  },
  logoSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logoSmallImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  tabActive: {
    backgroundColor: '#2e7d32',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#999',
  },
  filterIcon: {
    fontSize: 18,
  },
  filterButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#999',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  filterOption: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: '#2e7d32',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardQty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cardTime: {
    fontSize: 12,
    color: '#999',
  },
  offersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  offersLabel: {
    fontSize: 14,
    color: '#666',
  },
  offersCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statusRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  statusPending: {
    color: '#f57c00',
  },
});
