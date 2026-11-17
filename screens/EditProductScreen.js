import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { showAlert } from '../utils/alert';

const CATEGORIES = ['Fruits', 'Vegetables', 'Meats', 'Dairy', 'Grains', 'Other'];
const STATUS_OPTIONS = ['available', 'out_of_stock', 'inactive'];

export default function EditProductScreen({ navigation, route }) {
  const { product } = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : 'Fruits',
    price: product?.price ? product.price.toString() : '',
    originalPrice: product?.original_price ? product.original_price.toString() : '',
    quantity: product?.quantity || '',
    image: product?.image || '',
    status: product?.status || 'available',
  });

  const setField = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showAlert('Error', 'Please enter a product name');
      return;
    }

    if (!form.price || isNaN(parseFloat(form.price))) {
      showAlert('Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category.toLowerCase(),
          price: parseFloat(form.price),
          original_price: form.originalPrice ? parseFloat(form.originalPrice) : null,
          quantity: form.quantity.trim(),
          image: form.image.trim(),
          status: form.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (error) throw error;

      showAlert('Success', 'Product updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating product:', error);
      showAlert('Error', 'Failed to update product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Product</Text>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            value={form.name}
            onChangeText={(text) => setField('name', text)}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryChip, form.category === category && styles.categoryChipActive]}
                onPress={() => setField('category', category)}
              >
                <Text style={[styles.categoryChipText, form.category === category && styles.categoryChipTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Price (₱) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            value={form.price}
            onChangeText={(text) => setField('price', text)}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Original Price (₱)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter original price (optional)"
            value={form.originalPrice}
            onChangeText={(text) => setField('originalPrice', text)}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 10 kg, 5 boxes"
            value={form.quantity}
            onChangeText={(text) => setField('quantity', text)}
          />

          <Text style={styles.label}>Image (Emoji or URL)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 🍎 or https://..."
            value={form.image}
            onChangeText={(text) => setField('image', text)}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter product description"
            value={form.description}
            onChangeText={(text) => setField('description', text)}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Status</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.statusChip, form.status === status && styles.statusChipActive]}
                onPress={() => setField('status', status)}
              >
                <Text style={[styles.statusChipText, form.status === status && styles.statusChipTextActive]}>
                  {status === 'available' ? 'Available' : status === 'out_of_stock' ? 'Out of Stock' : 'Inactive'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Update Product</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
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
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
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
  submitButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
