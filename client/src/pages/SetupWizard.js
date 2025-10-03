import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SetupContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #1e4620;
  text-align: center;
  margin-bottom: 2rem;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const StepDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#1e4620' : '#e0e0e0'};
  margin: 0 8px;
  transition: background-color 0.3s;
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled.button`
  background-color: ${props => props.secondary ? 'transparent' : '#1e4620'};
  color: ${props => props.secondary ? '#1e4620' : 'white'};
  border: ${props => props.secondary ? '1px solid #1e4620' : 'none'};
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.secondary ? 'rgba(30, 70, 32, 0.1)' : '#143016'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 2rem;
`;

const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    dbHost: 'localhost',
    dbPort: '5432',
    dbName: 'evergreenbank',
    dbUser: 'postgres',
    dbPassword: '',
    backendUrl: 'http://localhost:5000',
    adminUsername: '',
    adminPassword: '',
    adminEmail: '',
    bankName: 'Evergreen Bank',
    supportEmail: 'support@evergreenbank.com',
    address: '123 Financial Street, Banking City, BC 12345',
    phone: '(555) 123-4567'
  });
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Database Configuration',
      fields: ['dbHost', 'dbPort', 'dbName', 'dbUser', 'dbPassword'],
      validation: Yup.object({
        dbHost: Yup.string().required('Database host is required'),
        dbPort: Yup.string().required('Database port is required'),
        dbName: Yup.string().required('Database name is required'),
        dbUser: Yup.string().required('Database user is required'),
        dbPassword: Yup.string().required('Database password is required')
      })
    },
    {
      title: 'Admin Account',
      fields: ['backendUrl', 'adminUsername', 'adminPassword', 'adminEmail'],
      validation: Yup.object({
        backendUrl: Yup.string().required('Backend URL is required'),
        adminUsername: Yup.string().required('Admin username is required'),
        adminPassword: Yup.string().min(8, 'Password must be at least 8 characters').required('Admin password is required'),
        adminEmail: Yup.string().email('Invalid email address').required('Admin email is required')
      })
    },
    {
      title: 'Bank Branding',
      fields: ['bankName', 'supportEmail', 'address', 'phone'],
      validation: Yup.object({
        bankName: Yup.string().required('Bank name is required'),
        supportEmail: Yup.string().email('Invalid email address').required('Support email is required'),
        address: Yup.string().required('Address is required'),
        phone: Yup.string().required('Phone number is required')
      })
    }
  ];

  const handleNext = (values) => {
    setFormData({ ...formData, ...values });
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (values) => {
    try {
      setError('');
      const finalData = { ...formData, ...values };
      
      const response = await axios.post('/api/setup/complete', finalData);
      
      if (response.data) {
        setSetupComplete(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during setup');
    }
  };

  const goToLogin = () => {
    navigate('/login');
  };

  const currentStepData = steps[currentStep - 1];

  if (setupComplete) {
    return (
      <SetupContainer>
        <SuccessMessage>
          <h2>Setup Complete!</h2>
          <p>Your Evergreen Bank application has been successfully configured.</p>
          <Button onClick={goToLogin}>Go to Login</Button>
        </SuccessMessage>
      </SetupContainer>
    );
  }

  return (
    <SetupContainer>
      <Title>Evergreen Bank Setup</Title>
      
      <StepIndicator>
        {steps.map((_, index) => (
          <StepDot key={index} active={currentStep === index + 1} />
        ))}
      </StepIndicator>
      
      <h2>{currentStepData.title}</h2>
      
      {error && <ErrorText>{error}</ErrorText>}
      
      <Formik
        initialValues={Object.fromEntries(
          currentStepData.fields.map(field => [field, formData[field]])
        )}
        validationSchema={currentStepData.validation}
        onSubmit={currentStep === steps.length ? handleSubmit : handleNext}
      >
        {({ isSubmitting, isValid }) => (
          <Form>
            {currentStepData.fields.map(field => (
              <FormGroup key={field}>
                <Label htmlFor={field}>
                  {field === 'dbHost' ? 'Database Host' :
                   field === 'dbPort' ? 'Database Port' :
                   field === 'dbName' ? 'Database Name' :
                   field === 'dbUser' ? 'Database User' :
                   field === 'dbPassword' ? 'Database Password' :
                   field === 'backendUrl' ? 'Backend URL' :
                   field === 'adminUsername' ? 'Admin Username' :
                   field === 'adminPassword' ? 'Admin Password' :
                   field === 'adminEmail' ? 'Admin Email' :
                   field === 'bankName' ? 'Bank Name' :
                   field === 'supportEmail' ? 'Support Email' :
                   field === 'address' ? 'Address' :
                   field === 'phone' ? 'Phone Number' : field}
                </Label>
                <Input
                  type={field.includes('Password') ? 'password' : 'text'}
                  id={field}
                  name={field}
                />
                <ErrorMessage name={field} component={ErrorText} />
              </FormGroup>
            ))}
            
            <ButtonGroup>
              {currentStep > 1 && (
                <Button type="button" secondary onClick={handlePrevious}>
                  Previous
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting || !isValid}
              >
                {currentStep === steps.length ? 'Complete Setup' : 'Next'}
              </Button>
            </ButtonGroup>
          </Form>
        )}
      </Formik>
    </SetupContainer>
  );
};

export default SetupWizard;