import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function SellerDashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Seller Dashboard</Text>
          <Text style={styles.welcomeSubtitle}>Manage your farm and sales</Text>
        </View>

        <View style={styles.dashboardGrid}>
          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Text style={styles.dashboardIcon}>📊</Text>
            <Text style={styles.dashboardTitle}>Sales and Earnings</Text>
            <Text style={styles.dashboardSubtitle}>View revenue & orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() => navigation.navigate('Orders')}
          >
            <Text style={styles.dashboardIcon}>🛍️</Text>
            <Text style={styles.dashboardTitle}>Order Management</Text>
            <Text style={styles.dashboardSubtitle}>Track incoming orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() => navigation.navigate('MyProducts')}
          >
            <Text style={styles.dashboardIcon}>📦</Text>
            <Text style={styles.dashboardTitle}>My Products</Text>
            <Text style={styles.dashboardSubtitle}>Manage listings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() => navigation.navigate('Add', { mode: 'listing' })}
          >
            <Text style={styles.dashboardIcon}>➕</Text>
            <Text style={styles.dashboardTitle}>Add Product</Text>
            <Text style={styles.dashboardSubtitle}>Create new listing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.dashboardIcon}>💬</Text>
            <Text style={styles.dashboardTitle}>Messages</Text>
            <Text style={styles.dashboardSubtitle}>Buyer inquiries</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.dashboardIcon}>👤</Text>
            <Text style={styles.dashboardTitle}>Seller Profile</Text>
            <Text style={styles.dashboardSubtitle}>Account settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} onPress={() => navigation.navigate('Home')}>
          <Text style={[styles.navIcon, styles.navIconActive]}>📊</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MyProducts')}>
          <Text style={styles.navIcon}>📦</Text>
          <Text style={styles.navLabel}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Add', { mode: 'listing' })}>
          <Text style={styles.navIcon}>➕</Text>
          <Text style={styles.navLabel}>Add Product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.navIcon}>🛍️</Text>
          <Text style={styles.navLabel}>Orders</Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dashboardCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 1,
  },
  dashboardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  dashboardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  dashboardSubtitle: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    justifyContent: 'space-between',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navItemActive: {
    // active state
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navIconActive: {
    color: '#087F5B',
  },
  navLabel: {
    fontSize: 11,
    color: '#333',
  },
  navLabelActive: {
    color: '#087F5B',
    fontWeight: '600',
  },
});
