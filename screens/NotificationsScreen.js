import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { supabase } from '../lib/supabase';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    messages: true,
    priceAlerts: false,
  });

  const handleToggle = async (key, value) => {
    setNotifications({ ...notifications, [key]: value });
    // TODO: Save to Supabase
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Order Updates</Text>
              <Text style={styles.settingDescription}>Get notified about order status changes</Text>
            </View>
            <Switch
              value={notifications.orderUpdates}
              onValueChange={(value) => handleToggle('orderUpdates', value)}
              trackColor={{ false: '#e0e0e0', true: '#2e7d32' }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Promotions</Text>
              <Text style={styles.settingDescription}>Receive promotional offers and discounts</Text>
            </View>
            <Switch
              value={notifications.promotions}
              onValueChange={(value) => handleToggle('promotions', value)}
              trackColor={{ false: '#e0e0e0', true: '#2e7d32' }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Messages</Text>
              <Text style={styles.settingDescription}>Get notified about new messages</Text>
            </View>
            <Switch
              value={notifications.messages}
              onValueChange={(value) => handleToggle('messages', value)}
              trackColor={{ false: '#e0e0e0', true: '#2e7d32' }}
            />
          </View>

          <View style={[styles.settingRow, styles.lastRow]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Price Alerts</Text>
              <Text style={styles.settingDescription}>Get notified when prices drop</Text>
            </View>
            <Switch
              value={notifications.priceAlerts}
              onValueChange={(value) => handleToggle('priceAlerts', value)}
              trackColor={{ false: '#e0e0e0', true: '#2e7d32' }}
            />
          </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
});
