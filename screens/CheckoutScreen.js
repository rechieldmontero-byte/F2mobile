import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { showAlert } from '../utils/alert';

const PAYMENT_METHODS = [
  { id: 'gcash', label: 'GCash', icon: '📱', desc: 'Pay via GCash' },
  { id: 'maya', label: 'Maya', icon: '💳', desc: 'Pay via Maya wallet' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦', desc: 'BDO, BPI, UnionBank, etc.' },
];

export default function CheckoutScreen({ navigation, route }) {
  const items = route?.params?.items || [];
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, item) => {
    return sum + (parseFloat(item.price) || 0) * (item.quantity || 1);
  }, 0);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      showAlert('Error', 'Your cart is empty');
      return;
    }

    if ((paymentMethod === 'gcash' || paymentMethod === 'maya' || paymentMethod === 'bank') && !referenceNumber.trim()) {
      showAlert('Error', 'Please enter your payment reference number');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showAlert('Error', 'You must be logged in to place an order');
        return;
      }

      const orderItems = items.map((item) => ({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        price: parseFloat(item.price) || 0,
      }));

      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user.id,
        buyer_id: user.id,
        status: 'pending',
        payment_method: paymentMethod,
        payment_reference: paymentMethod === 'cod' ? null : referenceNumber.trim(),
        payment_status: paymentMethod === 'cod' ? 'pending' : 'submitted',
        total_amount: total,
        items: orderItems,
      }).select().single();

      if (error) throw error;

      // Insert normalized order_items for valid product UUIDs (seller order tracking)
      if (order?.id) {
        const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const orderItemRows = orderItems
          .filter((i) => UUID_RE.test(i.product_id))
          .map((i) => ({
            order_id: order.id,
            product_id: i.product_id,
            quantity: i.quantity,
            price: i.price,
          }));
        if (orderItemRows.length > 0) {
          await supabase.from('order_items').insert(orderItemRows);
        }
      }

      // Auto-navigate to Orders after successful order
      showAlert(
        'Order Placed!',
        `Your order of ₱${total.toLocaleString()} has been placed successfully. Payment method: ${PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}.`
      );
      navigation.replace('Orders');
    } catch (error) {
      console.error('Order error:', error);
      showAlert('Error', error.message || 'Failed to place order');
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
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item, index) => (
            <View key={item.id || index} style={styles.itemRow}>
              <Text style={styles.itemEmoji}>{item.image || '📦'}</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity || 1}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ₱{((parseFloat(item.price) || 0) * (item.quantity || 1)).toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₱{total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.methodCard, paymentMethod === method.id && styles.methodCardActive]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Text style={styles.methodIcon}>{method.icon}</Text>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodLabel, paymentMethod === method.id && styles.methodLabelActive]}>
                  {method.label}
                </Text>
                <Text style={styles.methodDesc}>{method.desc}</Text>
              </View>
              <View style={[styles.radio, paymentMethod === method.id && styles.radioActive]}>
                {paymentMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reference Number for e-wallets/bank */}
        {paymentMethod !== 'cod' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Reference</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter reference number / receipt no."
              value={referenceNumber}
              onChangeText={setReferenceNumber}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderText}>
              Place Order • ₱{total.toLocaleString()}
            </Text>
          )}
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
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemQty: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  methodCardActive: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  methodIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  methodLabelActive: {
    color: '#2e7d32',
  },
  methodDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: '#2e7d32',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2e7d32',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  placeOrderButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
