import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from './supabaseService';

const STORAGE_KEY = '@agrihub_saved_products';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  return url && key && url !== 'https://your-project.supabase.co' && key !== 'your-anon-key';
};

// Helper to get user ID
async function getUserId() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const user = await getCurrentUser();
    return user?.id;
  } catch (error) {
    console.log('Supabase not available, using local storage');
    return null;
  }
}

// Local (AsyncStorage) helpers
async function getLocalSaved() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

async function setLocalSaved(items) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Fetch saved products from Supabase for logged-in user
async function getSupabaseSaved(userId) {
  const { data, error } = await supabase
    .from('saved_products')
    .select('*, products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || [])
    .filter((item) => item.products)
    .map((item) => ({
      ...item.products,
      quantity: item.quantity,
      savedAt: item.created_at,
    }));
}

export async function getSavedProducts() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return await getLocalSaved();
    }

    // Merge Supabase saved items with local fallback items (dedupe by id)
    let remote = [];
    try {
      remote = await getSupabaseSaved(userId);
    } catch (error) {
      console.error('Error loading saved products from Supabase:', error);
    }
    const local = await getLocalSaved();
    const remoteIds = new Set(remote.map((p) => p.id));
    const merged = [...remote, ...local.filter((p) => !remoteIds.has(p.id))];
    return merged;
  } catch (error) {
    console.error('Error loading saved products:', error);
    return await getLocalSaved();
  }
}

export async function saveProduct(product) {
  try {
    const userId = await getUserId();

    // Try Supabase first (only if logged in)
    if (userId) {
      try {
        const { data, error } = await supabase
          .from('saved_products')
          .insert([{ user_id: userId, product_id: product.id, quantity: 1 }])
          .select()
          .single();

        if (!error && data) {
          return { ...product, quantity: 1, savedAt: data.created_at };
        }
      } catch (supabaseError) {
        console.log('Supabase save failed, using local storage:', supabaseError.message);
      }
    }

    // Fallback / local storage
    const saved = await getLocalSaved();
    const existing = saved.find((p) => p.id === product.id);
    if (existing) {
      return existing;
    }
    const newProduct = { ...product, quantity: 1, savedAt: Date.now() };
    saved.push(newProduct);
    await setLocalSaved(saved);
    return newProduct;
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
}

export async function removeProduct(productId) {
  try {
    const userId = await getUserId();

    // Remove from local storage always
    const local = await getLocalSaved();
    await setLocalSaved(local.filter((p) => p.id !== productId));

    // Remove from Supabase if logged in
    if (userId) {
      try {
        await supabase
          .from('saved_products')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);
      } catch (error) {
        console.log('Supabase remove failed:', error.message);
      }
    }

    return await getSavedProducts();
  } catch (error) {
    console.error('Error removing product:', error);
    throw error;
  }
}

export async function updateQuantity(productId, delta) {
  try {
    const userId = await getUserId();

    // Update local storage
    const local = await getLocalSaved();
    const localProduct = local.find((p) => p.id === productId);
    if (localProduct) {
      localProduct.quantity = Math.max(1, localProduct.quantity + delta);
      await setLocalSaved(local);
    }

    // Update Supabase if logged in
    if (userId) {
      try {
        const { data: savedItem } = await supabase
          .from('saved_products')
          .select('quantity')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .single();

        if (savedItem) {
          const newQuantity = Math.max(1, savedItem.quantity + delta);
          await supabase
            .from('saved_products')
            .update({ quantity: newQuantity })
            .eq('user_id', userId)
            .eq('product_id', productId);
        }
      } catch (error) {
        console.log('Supabase quantity update failed:', error.message);
      }
    }

    return await getSavedProducts();
  } catch (error) {
    console.error('Error updating quantity:', error);
    throw error;
  }
}

export async function isProductSaved(productId) {
  try {
    const userId = await getUserId();
    if (!userId) {
      const saved = await getLocalSaved();
      return saved.some((p) => p.id === productId);
    }

    try {
      const { data, error } = await supabase
        .from('saved_products')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (!error && data) return true;
    } catch {}

    const local = await getLocalSaved();
    return local.some((p) => p.id === productId);
  } catch (error) {
    console.error('Error checking saved status:', error);
    return false;
  }
}
