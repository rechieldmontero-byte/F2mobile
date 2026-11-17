import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../lib/supabase';

const TABS = ['Supply', 'Group Buying', 'Fulfillment', 'Auction'];

export default function ActivityScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState(route.params?.tab || 'Supply');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);

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
          query = supabase.from('products').select('*').order('created_at', { ascending: false }).limit(10);
          break;
        case 'Group Buying':
          query = supabase.from('group_buying').select('*').eq('status', 'open').order('created_at', { ascending: false });
          break;
        case 'Fulfillment':
          query = supabase.from('deliveries').select('*, orders(*)').order('created_at', { ascending: false });
          break;
        case 'Auction':
          query = supabase.from('auctions').select('*').eq('status', 'active').order('end_time', { ascending: true });
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
        <Text style={styles.filterIcon}>⚙️</Text>
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

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Explore')}>
          <Text style={styles.navIcon}>⊞</Text>
          <Text style={styles.navLabel}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('SavedProducts')}>
          <Text style={styles.navIcon}>💾</Text>
          <Text style={styles.navLabel}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#888',
  },
});
