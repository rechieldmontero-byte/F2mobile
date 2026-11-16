import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function CartScreen({ route, navigation }) {
  const [items, setItems] = useState([]);

  // When a product is passed from DetailsScreen, add it once
  React.useEffect(() => {
    if (route.params?.product) {
      const product = route.params.product;
      setItems((prev) => {
        const exists = prev.find((i) => i.id === product.id);
        if (exists) return prev;
        return [...prev, { ...product, qty: 1 }];
      });
      navigation?.setParams({ product: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.product]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Cart</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>Cart is empty.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
              <Text style={styles.qty}>Qty: {item.qty}</Text>
            </View>
          )}
        />
      )}
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
    marginBottom: 15,
    color: '#1b5e20',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 14,
    color: '#2e7d32',
    marginTop: 2,
  },
  qty: {
    fontSize: 15,
    color: '#555',
  },
});
