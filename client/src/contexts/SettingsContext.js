import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    setup_complete: 'false',
    bank_name: 'Evergreen Bank',
    support_email: 'support@evergreenbank.com',
    address: '123 Financial Street, Banking City, BC 12345',
    phone: '(555) 123-4567',
    session_timeout: '15'
  });
  const [loading, setLoading] = useState(true);

  // Fetch all settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/settings');
      
      if (res.data) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...res.data
        }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a single setting
  const updateSetting = async (key, value) => {
    try {
      const res = await axios.put(`/api/settings/${key}`, { value });
      
      if (res.data) {
        setSettings(prevSettings => ({
          ...prevSettings,
          [key]: value
        }));
        return { success: true };
      }
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update setting' 
      };
    }
  };

  // Update multiple settings at once
  const updateSettings = async (settingsToUpdate) => {
    try {
      const settingsArray = Object.entries(settingsToUpdate).map(([key, value]) => ({ key, value }));
      
      const res = await axios.post('/api/settings/batch', { settings: settingsArray });
      
      if (res.data) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...settingsToUpdate
        }));
        return { success: true };
      }
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update settings' 
      };
    }
  };

  const value = {
    settings,
    loading,
    fetchSettings,
    updateSetting,
    updateSettings
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};