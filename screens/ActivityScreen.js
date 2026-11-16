import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';

const TABS = ['Supply', 'Group Buying', 'Fulfillment', 'Auction'];

export default function ActivityScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState(route.params?.tab || 'Supply');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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

      <ScrollView style={styles.content}>
        <Text style={styles.cardTitle}>Requested Supply</Text>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>Fresh Tomato</Text>
            <Text style={styles.cardQty}>20 KG</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Total Amount</Text>
            <Text style={styles.cardValue}>₱1,250</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>₱62.50/KG</Text>
            <Text style={styles.cardTime}>10:30 am, October 22</Text>
          </View>
          <View style={styles.offersRow}>
            <Text style={styles.offersLabel}>Offers Received</Text>
            <Text style={styles.offersCount}>10</Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>Purchased</Text>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>Fresh Tomato</Text>
            <Text style={styles.cardQty}>20 KG</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Total Amount</Text>
            <Text style={styles.cardValue}>₱1,250</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>₱62.50/KG</Text>
            <Text style={styles.cardTime}>10:30 am, October 22</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Harvest</Text>
            <Text style={styles.cardValue}>30 Nov 2023</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.status}>Ongoing</Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>Made Offer</Text>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>Fresh Carrots</Text>
            <Text style={styles.cardQty}>15 KG</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Total Amount</Text>
            <Text style={styles.cardValue}>₱750</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>₱50/KG</Text>
            <Text style={styles.cardTime}>2:15 pm, October 23</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={[styles.status, styles.statusPending]}>Pending</Text>
          </View>
        </View>
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
