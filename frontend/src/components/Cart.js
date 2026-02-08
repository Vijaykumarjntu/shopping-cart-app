import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css';

// SVG Icons
const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const Cart = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/carts');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await api.put(`/carts/${itemId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/carts/${itemId}`);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    
    try {
      const response = await api.post('/orders');
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      alert(error.response?.data?.error || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="cart-container">
        <div className="cart-header">
          <ShoppingCartIcon />
          <h1 className="cart-title">Your Shopping Cart</h1>
        </div>

        {cart.items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCartIcon />
            <h3>Your cart is empty</h3>
            <p>Add some items to get started</p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cart.items.map((cartItem) => (
                <div key={cartItem._id} className="cart-item">
                  <div className="cart-item-image">
                    {cartItem.item.image ? (
                      <img
                        src={cartItem.item.image}
                        alt={cartItem.item.name}
                      />
                    ) : (
                      <div style={{ color: '#9ca3af' }}>
                        <PackageIcon />
                      </div>
                    )}
                  </div>
                  
                  <div className="cart-item-details">
                    <h3 className="cart-item-name">{cartItem.item.name}</h3>
                    <p className="cart-item-price">${cartItem.item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantity(cartItem.item._id, cartItem.quantity - 1)}
                        className="quantity-btn"
                      >
                        <MinusIcon />
                      </button>
                      <span className="quantity-display">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(cartItem.item._id, cartItem.quantity + 1)}
                        className="quantity-btn"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                    
                    <div className="cart-item-total">
                      ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </div>
                    
                    <button
                      onClick={() => removeItem(cartItem.item._id)}
                      className="remove-item-btn"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-summary">
              <h2 className="order-summary-title">Order Summary</h2>
              
              <div className="order-items-list">
                {cart.items.map((cartItem) => (
                  <div key={cartItem._id} className="order-item-row">
                    <span>{cartItem.item.name} x {cartItem.quantity}</span>
                    <span>${(cartItem.item.price * cartItem.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-total">
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="btn btn-primary checkout-btn"
              >
                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;