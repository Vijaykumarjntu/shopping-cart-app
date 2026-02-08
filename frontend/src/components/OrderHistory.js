import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import '../styles/OrderHistory.css';
import { format } from 'date-fns';

// SVG Icons
const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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
      <div className="order-history-container">
        <div className="order-history-header">
          <PackageIcon />
          <h1 className="order-history-title">Order History</h1>
        </div>

        {orders.length === 0 ? (
          <div className="order-history-empty">
            <PackageIcon />
            <h3>No orders yet</h3>
            <p>Your completed orders will appear here</p>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order._id.slice(-8)}</h3>
                    <div className="order-date">
                      <CalendarIcon />
                      <span>
                        {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="order-amount">
                    <div className="order-total-amount">
                      <DollarIcon />
                      <span>{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <span className={`order-status ${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="order-items">
                  <h4 className="order-items-title">Items:</h4>
                  {order.items.map((orderItem, index) => (
                    <div key={index} className="order-item">
                      <div>
                        <span className="order-item-name">{orderItem.item.name}</span>
                        <span className="order-item-quantity">x {orderItem.quantity}</span>
                      </div>
                      <span className="order-item-price">
                        ${(orderItem.priceAtPurchase * orderItem.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;