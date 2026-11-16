import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { saveProduct, removeProduct, isProductSaved } from '../services/savedProducts';
import { showAlert } from '../utils/alert';

export default function ProductDetailScreen({ navigation, route }) {
  const { product } = route.params;
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    checkSavedStatus();
  }, [product.id]);

  const checkSavedStatus = async () => {
    const saved = await isProductSaved(product.id);
    setIsSaved(saved);
  };

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await removeProduct(product.id);
        setIsSaved(false);
      } else {
        await saveProduct(product);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      await saveProduct({ ...product, price: variants[selectedVariant].price });
      showAlert('Added to Cart', `${product.name} has been added to your cart.`, [
        { text: 'Continue Shopping' },
        { text: 'View Cart', onPress: () => navigation.navigate('SavedProducts') },
      ]);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showAlert('Error', 'Failed to add product to cart');
    }
  };

  const variants = [
    { name: '1 pc', price: product.price, originalPrice: product.originalPrice },
    { name: '2 pcs', price: Math.round(product.price * 1.8), originalPrice: Math.round(product.originalPrice * 1.8) },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleSaveToggle} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>{isSaved ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageCarousel}>
          <View style={styles.productImage}>
            <Text style={styles.productEmoji}>{product.image}</Text>
          </View>
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ 4.8</Text>
            <Text style={styles.reviews}>(120 reviews)</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>₱{variants[selectedVariant].price}</Text>
            <Text style={styles.originalPrice}>₱{variants[selectedVariant].originalPrice}</Text>
          </View>
        </View>

        <View style={styles.variantSection}>
          <Text style={styles.variantTitle}>Select Variants</Text>
          <View style={styles.variantList}>
            {variants.map((variant, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.variantCard, selectedVariant === index && styles.variantCardActive]}
                onPress={() => setSelectedVariant(index)}
              >
                <Text style={styles.variantName}>{variant.name}</Text>
                <Text style={styles.variantPrice}>
                  ₱{variant.price}/₱{variant.originalPrice}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureLabel}>Easy Refunds</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureLabel}>Secure Payment</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🚚</Text>
            <Text style={styles.featureLabel}>Fast Delivery</Text>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <View style={styles.descriptionHeader}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionArrow}>▼</Text>
          </View>
          <Text style={styles.descriptionText}>
            Fresh {product.name} sourced directly from local farmers. Grown naturally without
            harmful chemicals. Perfect for your daily cooking needs.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton]}
          onPress={handleSaveToggle}
        >
          <Text style={styles.saveButtonText}>{isSaved ? 'Saved ✓' : 'Save Product'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.addToCartButton]}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 20,
  },
  headerRight: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  imageCarousel: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  productEmoji: {
    fontSize: 100,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  dotActive: {
    backgroundColor: '#2e7d32',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 16,
    marginRight: 8,
  },
  reviews: {
    fontSize: 14,
    color: '#888',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  variantSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  variantTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  variantList: {
    flexDirection: 'row',
    gap: 12,
  },
  variantCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  variantCardActive: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  variantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  variantPrice: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  featuresSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: 12,
    color: '#666',
  },
  descriptionSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 100,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  descriptionArrow: {
    fontSize: 16,
    color: '#666',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  saveButtonText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addToCartButton: {
    backgroundColor: '#2e7d32',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
