import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import '../styles/ItemList.css';

// SVG Icons
const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (itemId) => {
    setAddingToCart(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await api.post('/carts', { itemId });
      
      // Show success feedback
      setAddingToCart(prev => ({ ...prev, [itemId]: 'success' }));
      setTimeout(() => {
        setAddingToCart(prev => ({ ...prev, [itemId]: false }));
      }, 2000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      setAddingToCart(prev => ({ ...prev, [itemId]: false }));
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
      <div className="item-list-container">
        <h1 className="item-list-title">Shop Products</h1>
        
        <div className="items-grid">
          {items.map((item) => (
            <div key={item._id} className="item-card">
              <div className="item-image-container">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="item-image"
                  />
                ) : (
                  <div className="item-placeholder">
                    <ShoppingBagIcon />
                  </div>
                )}
              </div>
              
              <div className="item-content">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-description">{item.description}</p>
                
                <div className="item-footer">
                  <span className="item-price">${item.price.toFixed(2)}</span>
                  
                  <button
                    onClick={() => addToCart(item._id)}
                    disabled={addingToCart[item._id]}
                    className={`btn btn-primary add-to-cart-btn ${addingToCart[item._id] === 'success' ? 'added' : ''}`}
                  >
                    {addingToCart[item._id] === 'success' ? (
                      <>
                        <CheckIcon />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemList;