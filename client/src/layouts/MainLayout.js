import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  background-color: #1e4620;
  color: white;
  padding: 0.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
`;

const NavMenu = styled.div`
  display: flex;
  margin-right: 2rem;
`;

const StyledNavLink = styled(NavLink)`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  border-radius: 4px;
  
  &.active {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const LogoutButton = styled.button`
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 2rem;
  background-color: #f5f7fa;
`;

const Footer = styled.footer`
  background-color: #f0f0f0;
  padding: 1rem 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: #666;
`;

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <LayoutContainer>
      <Header>
        <Logo>{settings.bank_name || 'Evergreen Bank'}</Logo>
        <Nav>
          <NavMenu>
            <StyledNavLink to="/dashboard">Dashboard</StyledNavLink>
            {user && user.role === 'admin' && (
              <>
                <StyledNavLink to="/admin/users">Users</StyledNavLink>
                <StyledNavLink to="/admin/settings">Settings</StyledNavLink>
              </>
            )}
          </NavMenu>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </Nav>
      </Header>
      
      <Content>
        <Outlet />
      </Content>
      
      <Footer>
        <div>{settings.bank_name || 'Evergreen Bank'} &copy; {new Date().getFullYear()}</div>
        <div>
          {settings.address || '123 Financial Street, Banking City, BC 12345'} | 
          {settings.phone || '(555) 123-4567'} | 
          {settings.support_email || 'support@evergreenbank.com'}
        </div>
      </Footer>
    </LayoutContainer>
  );
};

export default MainLayout;