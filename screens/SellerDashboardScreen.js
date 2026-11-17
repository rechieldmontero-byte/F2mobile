import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.png';

export default function SellerDashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    products: 0,
    revenue: 0,
    orders: 0,
    pending: 0,
    categories: {
      fruits: 0,
      vegetables: 0,
      meats: 0,
      dairy: 0,
      grains: 0,
      other: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const categoryIcons = {
    fruits: '🍎',
    vegetables: '🥬',
    meats: '🍗',
    dairy: '🥛',
    grains: '🌾',
    other: '📦',
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile for name and image
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name || profile.username || 'Seller');
        setProfileImage(profile.avatar_url || null);
      }

      // Fetch seller's products
      const { data: products } = await supabase
        .from('products')
        .select('id, category')
        .eq('user_id', user.id);

      const productCount = products?.length || 0;
      const categories = {
        fruits: 0,
        vegetables: 0,
        meats: 0,
        dairy: 0,
        grains: 0,
        other: 0,
      };
      products?.forEach(p => {
        const cat = (p.category || 'other').toLowerCase();
        if (categories.hasOwnProperty(cat)) {
          categories[cat]++;
        } else {
          categories.other++;
        }
      });

      // Fetch seller's product IDs
      const productIds = products?.map(p => p.id) || [];

      // Fetch order items for seller's products
      let revenue = 0;
      let orders = 0;
      let pending = 0;

      if (productIds.length > 0) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('order_id, quantity, price')
          .in('product_id', productIds);

        const orderIds = [...new Set(orderItems?.map(oi => oi.order_id) || [])];

        if (orderIds.length > 0) {
          const { data: orderData } = await supabase
            .from('orders')
            .select('id, status')
            .in('id', orderIds);

          orders = orderIds.length;
          pending = orderData?.filter(o => o.status === 'pending' || o.status === 'confirmed').length || 0;

          // Calculate revenue from order items
          revenue = orderItems?.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
          }, 0) || 0;
        }
      }

      setStats({
        products: productCount,
        revenue,
        orders,
        pending,
        categories,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Seller Dashboard</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={[styles.navItem, styles.navItemActive]} onPress={() => navigation.navigate('Home')}>
            <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
            <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeHeader}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeTitle}>Hello, {userName}!</Text>
              <Text style={styles.welcomeSubtitle}>Presko Baratu tatak ADSSU</Text>
            </View>
            <View style={styles.profileContainer}>
              <Image
                source={profileImage && profileImage.startsWith('http') ? { uri: profileImage } : logo}
                style={styles.profileImage}
              />
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Products by Category</Text>
          <View style={styles.categoryList}>
            {['fruits', 'vegetables', 'meats', 'dairy', 'grains', 'other']
              .filter(cat => cat.includes(searchQuery.toLowerCase()))
              .map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryItem}
                  onPress={() => navigation.navigate('MyProducts', { category })}
                >
                  <View style={styles.categoryLeft}>
                    <Text style={styles.categoryIcon}>{categoryIcons[category]}</Text>
                    <Text style={styles.categoryName}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                  </View>
                  <Text style={styles.categoryCount}>{stats.categories[category] || 0}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.products}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₱{stats.revenue.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.orders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyProducts')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => navigation.navigate('Add', { mode: 'listing' })}
            >
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>➕</Text>
              </View>
              <Text style={styles.productName}>Add Product</Text>
              <Text style={styles.productPrice}>Create listing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => navigation.navigate('Orders')}
            >
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>🛍️</Text>
              </View>
              <Text style={styles.productName}>View Orders</Text>
              <Text style={styles.productPrice}>{stats.orders} orders</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => navigation.navigate('Analytics')}
            >
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>📊</Text>
              </View>
              <Text style={styles.productName}>Analytics</Text>
              <Text style={styles.productPrice}>Track sales</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => navigation.navigate('MyProducts')}
            >
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>📦</Text>
              </View>
              <Text style={styles.productName}>My Products</Text>
              <Text style={styles.productPrice}>{stats.products} items</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} onPress={() => navigation.navigate('Home')}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
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
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
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
  profileContainer: {
    marginLeft: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#2e7d32',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    elevation: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categorySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b5e20',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    elevation: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productEmoji: {
    fontSize: 32,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 11,
    color: '#666',
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
