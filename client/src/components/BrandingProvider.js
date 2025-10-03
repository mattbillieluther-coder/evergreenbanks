import React, { createContext, useContext, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

// Create a context for branding
const BrandingContext = createContext();

// Custom hook to use branding
export const useBranding = () => useContext(BrandingContext);

// Provider component for branding
export const BrandingProvider = ({ children }) => {
  const { settings } = useSettings();
  
  // Update document title and favicon dynamically
  useEffect(() => {
    if (settings.bank_name) {
      document.title = settings.bank_name;
      
      // You could also dynamically update favicon here if needed
      // const favicon = document.querySelector('link[rel="icon"]');
      // if (favicon) favicon.href = '/path/to/dynamic/favicon.ico';
    }
  }, [settings.bank_name]);
  
  // Apply global CSS variables for branding colors
  useEffect(() => {
    const root = document.documentElement;
    
    // Set default branding colors
    root.style.setProperty('--primary-color', '#1e4620');
    root.style.setProperty('--secondary-color', '#143016');
    root.style.setProperty('--accent-color', '#4caf50');
    
    // If we had custom colors in settings, we could apply them here
    // if (settings.primary_color) {
    //   root.style.setProperty('--primary-color', settings.primary_color);
    // }
  }, [settings]);
  
  // Provide branding values and utilities
  const brandingValue = {
    bankName: settings.bank_name || 'Evergreen Bank',
    supportEmail: settings.support_email || 'support@evergreenbank.com',
    address: settings.address || '123 Evergreen Ave, Finance City, FC 12345',
    phone: settings.phone || '(555) 123-4567',
    
    // Helper function to format content with bank name
    formatWithBankName: (text) => {
      return text.replace(/\{bankName\}/g, settings.bank_name || 'Evergreen Bank');
    }
  };
  
  return (
    <BrandingContext.Provider value={brandingValue}>
      {children}
    </BrandingContext.Provider>
  );
};

export default BrandingProvider;