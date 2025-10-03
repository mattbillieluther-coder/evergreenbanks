import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import styled from 'styled-components';

const AuthContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
`;

const AuthContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e4620;
  margin-bottom: 0.5rem;
`;

const Tagline = styled.div`
  font-size: 1rem;
  color: #666;
`;

const AuthLayout = () => {
  const { settings } = useSettings();

  return (
    <AuthContainer>
      <AuthContent>
        <BrandSection>
          <Logo>{settings.bank_name || 'Evergreen Bank'}</Logo>
          <Tagline>Secure Banking Solutions</Tagline>
        </BrandSection>
        <Outlet />
      </AuthContent>
    </AuthContainer>
  );
};

export default AuthLayout;