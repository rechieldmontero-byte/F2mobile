import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { showAlert } from '../utils/alert';

const CATEGORIES = [
  { name: 'Meats', icon: '🍗' },
  { name: 'Veggies', icon: '🥬' },
  { name: 'Fruits', icon: '🍎' },
  { name: 'Dairy', icon: '🥛' },
  { name: 'Grains', icon: '🌾' },
  { name: 'Other', icon: '📦' },
];
const CATEGORY_EMOJI = {
  Meats: '🍗',
  Veggies: '🥬',
  Fruits: '🍎',
  Dairy: '🥛',
  Grains: '🌾',
  Other: '📦',
};

export default function AddScreen({ navigation, route }) {
  const [mode, setMode] = useState(route?.params?.mode || 'listing'); // 'listing' | 'request'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'Veggies',
    quantity: '',
    price: '',
    originalPrice: '',
    budget: '',
    description: '',
  });

  const setField = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showAlert('Error', 'Please enter a name/title');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showAlert('Error', 'You must be logged in to create a listing or request');
        return;
      }

      const category = form.category.toLowerCase();

      if (mode === 'listing') {
        if (!form.price || isNaN(parseFloat(form.price))) {
          showAlert('Error', 'Please enter a valid price');
          return;
        }
        const { error } = await supabase.from('products').insert({
          user_id: user.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: parseFloat(form.price),
          original_price: form.originalPrice ? parseFloat(form.originalPrice) : null,
          quantity: form.quantity.trim() || null,
          category,
          image: CATEGORY_EMOJI[form.category] || '📦',
        });
        if (error) throw error;
        showAlert('Success', 'Product listing created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const { error } = await supabase.from('requests').insert({
          user_id: user.id,
          title: form.name.trim(),
          category,
          quantity: form.quantity.trim() || null,
          budget: form.budget ? parseFloat(form.budget) : null,
          description: form.description.trim() || null,
        });
        if (error) throw error;
        showAlert('Success', 'Request posted successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Submit error:', error);
      showAlert('Error', error.message || 'Failed to submit');
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
        <TouchableOpacity onPress={() => navigation.replace('Home')} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New</Text>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Create a new listing or request</Text>

        {/* Mode selector */}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'listing' && styles.modeButtonActive]}
            onPress={() => setMode('listing')}
          >
            <Text style={[styles.modeText, mode === 'listing' && styles.modeTextActive]}>
              📦 Sell Product
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'request' && styles.modeButtonActive]}
            onPress={() => setMode('request')}
          >
            <Text style={[styles.modeText, mode === 'request' && styles.modeTextActive]}>
              🛒 Request
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{mode === 'listing' ? 'Product Name' : 'What do you need?'}</Text>
          <TextInput
            style={styles.input}
            placeholder={mode === 'listing' ? 'e.g. Fresh Tomatoes' : 'e.g. Looking for 50kg rice'}
            value={form.name}
            onChangeText={(v) => setField('name', v)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={[styles.categoryChip, form.category === cat.name && styles.categoryChipActive]}
                onPress={() => setField('category', cat.name)}
              >
                <Text style={[styles.categoryChipText, form.category === cat.name && styles.categoryChipTextActive]}>
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder={mode === 'listing' ? 'e.g. 10 kg' : 'e.g. 50 kg'}
              value={form.quantity}
              onChangeText={(v) => setField('quantity', v)}
            />
          </View>
          {mode === 'listing' ? (
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Price (₱)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 120"
                value={form.price}
                onChangeText={(v) => setField('price', v)}
                keyboardType="numeric"
              />
            </View>
          ) : (
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Budget (₱)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5000"
                value={form.budget}
                onChangeText={(v) => setField('budget', v)}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        {mode === 'listing' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Original Price (₱, optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 150"
              value={form.originalPrice}
              onChangeText={(v) => setField('originalPrice', v)}
              keyboardType="numeric"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your product or request..."
            value={form.description}
            onChangeText={(v) => setField('description', v)}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : mode === 'listing' ? 'Publish Listing' : 'Post Request'}
          </Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  modeButtonActive: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modeTextActive: {
    color: '#2e7d32',
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
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
