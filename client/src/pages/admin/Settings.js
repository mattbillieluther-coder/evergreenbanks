import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import styled from 'styled-components';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const SettingsContainer = styled.div`
  padding: 1.5rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled(Field)`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const ErrorText = styled.div`
  color: #e53935;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const Button = styled.button`
  background-color: #1e4620;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #143016;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const SettingsSchema = Yup.object().shape({
  bank_name: Yup.string().required('Bank name is required'),
  support_email: Yup.string().email('Invalid email address').required('Support email is required'),
  address: Yup.string().required('Address is required'),
  phone: Yup.string().required('Phone number is required'),
  session_timeout: Yup.number()
    .required('Session timeout is required')
    .min(1, 'Timeout must be at least 1 minute')
    .max(60, 'Timeout cannot exceed 60 minutes')
});

const Settings = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      
      await updateSettings(values);
      
      setSuccess('Settings updated successfully');
      window.scrollTo(0, 0);
    } catch (err) {
      setError('Failed to update settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user.isAdmin) {
    return (
      <SettingsContainer>
        <h1>Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </SettingsContainer>
    );
  }

  return (
    <SettingsContainer>
      <h1>Application Settings</h1>
      <p>Configure your banking application settings here. These settings affect the entire application.</p>
      
      {success && <SuccessMessage>{success}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Card>
        <h2>Branding Settings</h2>
        
        <Formik
          initialValues={{
            bank_name: settings.bank_name || '',
            support_email: settings.support_email || '',
            address: settings.address || '',
            phone: settings.phone || '',
            session_timeout: settings.session_timeout || 15
          }}
          validationSchema={SettingsSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <FormGroup>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input type="text" id="bank_name" name="bank_name" />
                {errors.bank_name && touched.bank_name && (
                  <ErrorText>{errors.bank_name}</ErrorText>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="support_email">Support Email</Label>
                <Input type="email" id="support_email" name="support_email" />
                {errors.support_email && touched.support_email && (
                  <ErrorText>{errors.support_email}</ErrorText>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="address">Address</Label>
                <Input type="text" id="address" name="address" />
                {errors.address && touched.address && (
                  <ErrorText>{errors.address}</ErrorText>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="phone">Phone Number</Label>
                <Input type="text" id="phone" name="phone" />
                {errors.phone && touched.phone && (
                  <ErrorText>{errors.phone}</ErrorText>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                <Input type="number" id="session_timeout" name="session_timeout" min="1" max="60" />
                {errors.session_timeout && touched.session_timeout && (
                  <ErrorText>{errors.session_timeout}</ErrorText>
                )}
              </FormGroup>
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </Button>
            </Form>
          )}
        </Formik>
      </Card>
    </SettingsContainer>
  );
};

export default Settings;