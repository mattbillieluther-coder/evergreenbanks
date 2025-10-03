import React, { createContext, useContext, useState } from 'react';
import styled from 'styled-components';
import { useBranding } from './BrandingProvider';

// Create context for notifications
const NotificationContext = createContext();

// Styled components for notifications
const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NotificationItem = styled.div`
  padding: 15px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 300px;
  max-width: 400px;
  animation: slideIn 0.3s ease-out forwards;
  background-color: ${props => {
    switch (props.type) {
      case 'success': return '#e8f5e9';
      case 'error': return '#ffebee';
      case 'warning': return '#fff8e1';
      default: return '#e3f2fd';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#2e7d32';
      case 'error': return '#c62828';
      case 'warning': return '#f57f17';
      default: return '#1565c0';
    }
  }};
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  margin-left: 10px;
`;

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const branding = useBranding();
  
  // Add a new notification
  const addNotification = (message, type = 'info', duration = 5000) => {
    // Replace any branding placeholders in the message
    const formattedMessage = message.replace(/{bankName}/g, branding.bankName);
    
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message: formattedMessage, type }]);
    
    // Auto-remove notification after duration
    if (duration) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };
  
  // Remove a notification by ID
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Shorthand methods for different notification types
  const success = (message, duration) => addNotification(message, 'success', duration);
  const error = (message, duration) => addNotification(message, 'error', duration);
  const warning = (message, duration) => addNotification(message, 'warning', duration);
  const info = (message, duration) => addNotification(message, 'info', duration);
  
  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification, success, error, warning, info }}>
      {children}
      <NotificationContainer>
        {notifications.map(notification => (
          <NotificationItem key={notification.id} type={notification.type}>
            <div>{notification.message}</div>
            <CloseButton onClick={() => removeNotification(notification.id)}>×</CloseButton>
          </NotificationItem>
        ))}
      </NotificationContainer>
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;