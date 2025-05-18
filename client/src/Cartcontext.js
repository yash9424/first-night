// Cartcontext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Import API_BASE_URL from config
import { API_BASE_URL } from './config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial cart from server
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/cart');
        setCart(response.data);
      } catch (err) {
        setError('Failed to load cart');
        console.error('Cart fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const addToCart = async (product) => {
    try {
      setLoading(true);
      const response = await api.post('/api/cart/add', { 
        productId: product._id,
        quantity: 1
      });
      setCart(response.data);
    } catch (err) {
      setError('Failed to add item to cart');
      console.error('Add to cart error:', err);
      throw err; // Re-throw to handle in components
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/api/cart/remove/${productId}`);
      setCart(response.data);
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error('Remove from cart error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/cart/update/${productId}`, { quantity });
      setCart(response.data);
    } catch (err) {
      setError('Failed to update cart');
      console.error('Update cart error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await api.delete('/api/cart/clear');
      setCart([]);
    } catch (err) {
      setError('Failed to clear cart');
      console.error('Clear cart error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        loading, 
        error,
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
