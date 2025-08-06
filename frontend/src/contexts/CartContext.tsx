import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  shopier_url: string;
  quantity: number;
  stock_quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  totalAmount: number;
  itemCount: number;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<{ success: boolean; message: string }>;
  updateQuantity: (productId: number, quantity: number) => Promise<{ success: boolean; message: string }>;
  removeFromCart: (productId: number) => Promise<{ success: boolean; message: string }>;
  clearCart: () => Promise<{ success: boolean; message: string }>;
  refreshCart: () => Promise<void>;
  getCheckoutInfo: () => Promise<{ success: boolean; data?: any; message: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Sepeti yükle
  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setTotalAmount(0);
      setItemCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/cart`);
      if (response.data.success) {
        setCartItems(response.data.cartItems);
        setTotalAmount(response.data.totalAmount);
        setItemCount(response.data.itemCount);
      }
    } catch (error) {
      console.error('Sepet yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı girişi/çıkışında sepeti güncelle
  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Sepete ürün eklemek için giriş yapmalısınız' };
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/cart/add`, {
        product_id: productId,
        quantity
      });

      if (response.data.success) {
        await refreshCart();
        return { success: true, message: response.data.message };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Sepete ekleme hatası'
      };
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Bu işlem için giriş yapmalısınız' };
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/cart/update`, {
        product_id: productId,
        quantity
      });

      if (response.data.success) {
        await refreshCart();
        return { success: true, message: response.data.message };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Güncelleme hatası'
      };
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Bu işlem için giriş yapmalısınız' };
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/cart/remove/${productId}`);

      if (response.data.success) {
        await refreshCart();
        return { success: true, message: response.data.message };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Silme hatası'
      };
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      return { success: false, message: 'Bu işlem için giriş yapmalısınız' };
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/cart/clear`);

      if (response.data.success) {
        setCartItems([]);
        setTotalAmount(0);
        setItemCount(0);
        return { success: true, message: response.data.message };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Sepet temizleme hatası'
      };
    }
  };

  const getCheckoutInfo = async () => {
    if (!isAuthenticated) {
      return { success: false, message: 'Bu işlem için giriş yapmalısınız' };
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/cart/checkout-info`);

      if (response.data.success) {
        return { success: true, data: response.data, message: 'Checkout bilgileri alındı' };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Checkout bilgileri alınırken hata oluştu'
      };
    }
  };

  const value: CartContextType = {
    cartItems,
    totalAmount,
    itemCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    getCheckoutInfo
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};