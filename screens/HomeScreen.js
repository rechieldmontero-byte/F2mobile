import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { supabase } from '../lib/supabase';

export default function HomeScreen({ navigation }) {
  const [userType, setUserType] = useState('buyer');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchUserType();
  }, []);

  const fetchUserType = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_type, full_name')
          .eq('id', user.id)
          .single();
        if (profile?.account_type) {
          setUserType(profile.account_type);
        }
        if (profile?.full_name) {
          setUserName(profile.full_name);
        } else if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
        } else {
          setUserName(user.email?.split('@')[0] || 'User');
        }
      }
    } catch (error) {
      console.error('Error fetching user type:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <View style={styles.logoSmall}>
              <Image source={require('../assets/logo.png')} style={styles.logoSmallImage} resizeMode="contain" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Hello, {userName || 'User'}</Text>
              <Text style={styles.tagline}>presko baratu tatak adssu</Text>
            </View>
          </View>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>VEGETARIAN BIG SALE</Text>
          <Text style={styles.bannerSubtitle}>UP TO 70% OFF</Text>
        </View>

        {userType === 'seller' && (
          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Seller Dashboard</Text>
            <View style={styles.sellerGrid}>
              <TouchableOpacity
                style={styles.sellerItem}
                onPress={() => navigation.navigate('Add', { mode: 'listing' })}
              >
                <View style={styles.sellerIcon}>
                  <Text style={styles.iconEmoji}>➕</Text>
                </View>
                <Text style={styles.sellerLabel}>Add Product</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sellerItem}
                onPress={() => navigation.navigate('Orders')}
              >
                <View style={styles.sellerIcon}>
                  <Text style={styles.iconEmoji}>📋</Text>
                </View>
                <Text style={styles.sellerLabel}>My Orders</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sellerItem}
                onPress={() => navigation.navigate('Analytics')}
              >
                <View style={styles.sellerIcon}>
                  <Text style={styles.iconEmoji}>📊</Text>
                </View>
                <Text style={styles.sellerLabel}>Analytics</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommend for you</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.productCard}>
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>🥬</Text>
              </View>
              <Text style={styles.productName}>Radish</Text>
              <Text style={styles.productPrice}>₱25/kg</Text>
            </View>
            <View style={styles.productCard}>
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>🍅</Text>
              </View>
              <Text style={styles.productName}>Tomatoes</Text>
              <Text style={styles.productPrice}>₱80/kg</Text>
            </View>
            <View style={styles.productCard}>
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>🥕</Text>
              </View>
              <Text style={styles.productName}>Carrots</Text>
              <Text style={styles.productPrice}>₱60/kg</Text>
            </View>
            <View style={styles.productCard}>
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>🥔</Text>
              </View>
              <Text style={styles.productName}>Potatoes</Text>
              <Text style={styles.productPrice}>₱45/kg</Text>
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.activityGrid}>
            <TouchableOpacity
              style={styles.activityItem}
              onPress={() => navigation.navigate('Activity', { tab: 'Supply' })}
            >
              <View style={styles.activityIcon}>
                <Text style={styles.iconEmoji}>📦</Text>
              </View>
              <Text style={styles.activityLabel}>Supply</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.activityItem}
              onPress={() => navigation.navigate('Activity', { tab: 'Group Buying' })}
            >
              <View style={styles.activityIcon}>
                <Text style={styles.iconEmoji}>👥</Text>
              </View>
              <Text style={styles.activityLabel}>Group Buying</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.activityItem}
              onPress={() => navigation.navigate('Activity', { tab: 'Fulfillment' })}
            >
              <View style={styles.activityIcon}>
                <Text style={styles.iconEmoji}>🚚</Text>
              </View>
              <Text style={styles.activityLabel}>Fulfillment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.activityItem}
              onPress={() => navigation.navigate('Activity', { tab: 'Auction' })}
            >
              <View style={styles.activityIcon}>
                <Text style={styles.iconEmoji}>🔨</Text>
              </View>
              <Text style={styles.activityLabel}>Auction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} onPress={() => navigation.navigate('Home')}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Explore')}>
          <Text style={styles.navIcon}>⊞</Text>
          <Text style={styles.navLabel}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.navIcon}>📦</Text>
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
  scrollContent: {
    flex: 1,
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
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  tagline: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  banner: {
    margin: 16,
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#c8e6c9',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAll: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 1,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconEmoji: {
    fontSize: 24,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sellerSection: {
    padding: 16,
  },
  sellerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sellerItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 1,
  },
  sellerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  productCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    elevation: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productEmoji: {
    fontSize: 40,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: 'bold',
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
