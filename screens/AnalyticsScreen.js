import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AnalyticsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    pending: 0,
    recentOrders: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch seller's products
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', user.id);

      const productIds = products?.map(p => p.id) || [];

      // Fetch all orders (RLS returns own orders + orders containing seller's products)
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch order_items for seller's products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*');

      const allOrders = orders || [];
      const allOrderItems = orderItems || [];

      // Filter orders that contain seller's products
      const sellerOrderIds = new Set(
        allOrderItems
          .filter(item => productIds.includes(item.product_id))
          .map(item => item.order_id)
      );

      const salesOrders = allOrders.filter(o => sellerOrderIds.has(o.id));
      const ownOrders = allOrders.filter(o => o.buyer_id === user.id);

      // Calculate total sold quantity and revenue from seller's products
      const sellerOrderItems = allOrderItems.filter(item => productIds.includes(item.product_id));
      const totalSold = sellerOrderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalRevenue = sellerOrderItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

      const pending = salesOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;

      setStats({
        products: productIds.length,
        orders: salesOrders.length,
        purchases: ownOrders.length,
        revenue: totalRevenue,
        totalSold,
        pending,
        recentOrders: salesOrders.slice(0, 5),
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'completed': return '#2e7d32';
      case 'pending': return '#f9a825';
      case 'cancelled': return '#c62828';
      default: return '#1565c0';
    }
  };

  const paymentMethodLabel = (method) => {
    switch (method) {
      case 'gcash': return 'GCash';
      case 'maya': return 'Maya';
      case 'bank': return 'Bank Transfer';
      case 'cod': return 'Cash on Delivery';
      default: return method || 'Not set';
    }
  };

  const paymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#2e7d32';
      case 'submitted': return '#1565c0';
      case 'failed': return '#c62828';
      case 'refunded': return '#f9a825';
      default: return '#888';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2e7d32']} />}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>{stats.products}</Text>
            <Text style={styles.statLabel}>My Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={styles.statValue}>{stats.orders}</Text>
            <Text style={styles.statLabel}>Sales Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{stats.totalSold || 0}</Text>
            <Text style={styles.statLabel}>Total Sold</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>₱{(stats.revenue || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Income</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {stats.recentOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No orders yet</Text>
            </View>
          ) : (
            stats.recentOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(order.status) }]}>
                    <Text style={styles.statusText}>{order.status}</Text>
                  </View>
                </View>
                <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentText}>
                    💳 {paymentMethodLabel(order.payment_method)}
                  </Text>
                  {order.payment_status && (
                    <View style={[styles.payBadge, { backgroundColor: paymentStatusColor(order.payment_status) }]}>
                      <Text style={styles.payBadgeText}>{order.payment_status}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.orderTotal}>₱{parseFloat(order.total_amount || 0).toLocaleString()}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    fontSize: 28,
    color: '#1b5e20',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 1,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  paymentText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  payBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  payBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
});
