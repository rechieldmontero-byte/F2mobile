import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { showAlert } from '../utils/alert';

const CATEGORIES = ['All', 'Fruits', 'Vegetables', 'Meats', 'Dairy', 'Grains', 'Other'];
const STATUS_OPTIONS = ['available', 'out_of_stock', 'inactive'];

export default function MyProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchUserAndProducts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchProducts(userId);
      }
    }, [userId])
  );

  const fetchUserAndProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      await fetchProducts(user.id);
    } catch (error) {
      console.error('Error fetching user:', error);
      setLoading(false);
    }
  };

  const fetchProducts = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (productId) => {
    showAlert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

              if (error) throw error;
              await fetchProducts(userId);
              showAlert('Success', 'Product deleted successfully');
            } catch (error) {
              console.error('Error deleting product:', error);
              showAlert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId);

      if (error) throw error;
      await fetchProducts(userId);
      showAlert('Success', 'Product status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      showAlert('Error', 'Failed to update status');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    navigation.navigate('EditProduct', { product });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory.toLowerCase();
    const matchesStatus = selectedStatus === 'All' || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#2e7d32';
      case 'out_of_stock': return '#f57c00';
      case 'inactive': return '#c62828';
      default: return '#888';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'out_of_stock': return 'Out of Stock';
      case 'inactive': return 'Inactive';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Products</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading products...</Text>
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
        <Text style={styles.headerTitle}>My Products</Text>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[styles.categoryChipText, selectedCategory === category && styles.categoryChipTextActive]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
        <TouchableOpacity
          style={[styles.statusChip, selectedStatus === 'All' && styles.statusChipActive]}
          onPress={() => setSelectedStatus('All')}
        >
          <Text style={[styles.statusChipText, selectedStatus === 'All' && styles.statusChipTextActive]}>
            All Status
          </Text>
        </TouchableOpacity>
        {STATUS_OPTIONS.map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.statusChip, selectedStatus === status && styles.statusChipActive]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[styles.statusChipText, selectedStatus === status && styles.statusChipTextActive]}>
              {getStatusLabel(status)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>You haven't listed any products yet.</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('Add', { mode: 'listing' })}
          >
            <Text style={styles.addButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={styles.productHeader}>
                <Text style={styles.productEmoji}>{item.image || '📦'}</Text>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productCategory}>{item.category}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusBadgeText}>{getStatusLabel(item.status)}</Text>
                </View>
              </View>

              <View style={styles.productDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValue}>₱{parseFloat(item.price || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity:</Text>
                  <Text style={styles.detailValue}>{item.quantity || 'N/A'}</Text>
                </View>
                {item.description && (
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => navigation.navigate('ProductDetail', { product: item })}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status:</Text>
                {STATUS_OPTIONS.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusOption, item.status === status && styles.statusOptionActive]}
                    onPress={() => handleStatusChange(item.id, status)}
                  >
                    <Text style={[styles.statusOptionText, item.status === status && styles.statusOptionTextActive]}>
                      {getStatusLabel(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    padding: 16,
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
  searchBar: {
    backgroundColor: '#fff',
    padding: 12,
    margin: 16,
    borderRadius: 10,
    elevation: 1,
  },
  searchInput: {
    fontSize: 16,
    padding: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2e7d32',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  statusScroll: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  statusChipActive: {
    backgroundColor: '#2e7d32',
  },
  statusChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  productDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  productDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  viewButton: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#f57c00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#c62828',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  statusOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  statusOptionActive: {
    backgroundColor: '#2e7d32',
  },
  statusOptionText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  statusOptionTextActive: {
    color: '#fff',
  },
});
