import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { useSaved } from '../hooks/useSaved';

export default function ListScreen({ navigation, route }) {
  const category = route.params?.category || 'All';
  const { isSaved } = useSaved();

  const products =
    category === 'All'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === category);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Details', { product: item })}
    >
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemPrice}>{item.price}</Text>
        {isSaved(item.id) && <Text style={styles.savedBadge}>Saved</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {category === 'All' ? 'All Products' : category}
      </Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, cat === category && styles.chipActive]}
            onPress={() => navigation.setParams({ category: cat })}
          >
            <Text
              style={[styles.chipText, cat === category && styles.chipTextActive]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 15,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1b5e20',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#e8f5e9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  chipActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  chipText: {
    color: '#1b5e20',
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#fff',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemCategory: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  savedBadge: {
    fontSize: 11,
    color: '#fff',
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 4,
    overflow: 'hidden',
  },
});
