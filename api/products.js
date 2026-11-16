import { getProducts as getProductsFromSupabase } from '../services/supabaseService';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  return url && key && url !== 'https://your-project.supabase.co' && key !== 'your-anon-key';
};

// Fallback mock data if Supabase is not configured
const MOCK_PRODUCTS = [
  { id: '1', name: 'Fresh Eggs', quantity: '12 pcs', price: 120, originalPrice: 150, category: 'dairy', image: '🥚' },
  { id: '2', name: 'Spinach', quantity: '250g', price: 40, originalPrice: 50, category: 'veggies', image: '🥬' },
  { id: '3', name: 'Mangoes', quantity: '1kg', price: 120, originalPrice: 150, category: 'fruits', image: '🥭' },
  { id: '4', name: 'Chicken Breast', quantity: '500g', price: 180, originalPrice: 220, category: 'meats', image: '🍗' },
  { id: '5', name: 'Apples', quantity: '1kg', price: 150, originalPrice: 180, category: 'fruits', image: '🍎' },
  { id: '6', name: 'Broccoli', quantity: '300g', price: 50, originalPrice: 65, category: 'veggies', image: '🥦' },
  { id: '7', name: 'Milk', quantity: '1L', price: 85, originalPrice: 100, category: 'dairy', image: '🥛' },
  { id: '8', name: 'Beef', quantity: '500g', price: 250, originalPrice: 300, category: 'meats', image: '🥩' },
  { id: '9', name: 'Banana', quantity: '1kg', price: 60, originalPrice: 75, category: 'fruits', image: '🍌' },
  { id: '10', name: 'Grapes', quantity: '500g', price: 100, originalPrice: 130, category: 'fruits', image: '🍇' },
  { id: '11', name: 'Carrots', quantity: '500g', price: 35, originalPrice: 45, category: 'veggies', image: '🥕' },
  { id: '12', name: 'Cheese', quantity: '200g', price: 150, originalPrice: 180, category: 'dairy', image: '🧀' },
];

export const fetchProducts = async (category = 'all') => {
  // Simulate API call with delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Try to fetch from Supabase first (only if configured)
  if (isSupabaseConfigured()) {
    try {
      const supabaseProducts = await getProductsFromSupabase(category);
      if (supabaseProducts && supabaseProducts.length > 0) {
        return supabaseProducts.map((p) => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          price: p.price,
          originalPrice: p.original_price,
          category: p.category,
          image: p.image,
        }));
      }
    } catch (error) {
      console.log('Supabase fetch failed, using mock data');
    }
  }

  // Fallback to mock data
  // Simulate random failure (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Failed to fetch products');
  }

  if (category === 'all') return MOCK_PRODUCTS;
  return MOCK_PRODUCTS.filter((p) => p.category === category.toLowerCase());
};
