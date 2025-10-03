import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import styled from 'styled-components';
import axios from 'axios';

const DashboardContainer = styled.div`
  padding: 1.5rem;
`;

const WelcomeSection = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  color: #666;
  margin: 0 0 0.5rem 0;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e4620;
`;

const RecentActivity = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    notifications: 0
  });
  
  useEffect(() => {
    // In a real application, you would fetch dashboard data from the backend
    const fetchDashboardData = async () => {
      try {
        // This is a placeholder. In a real app, you would have an API endpoint for dashboard stats
        // const response = await axios.get('/api/dashboard/stats');
        // setStats(response.data);
        
        // For demo purposes, we'll set some placeholder stats
        if (user.isAdmin) {
          // Admin sees all users
          const usersResponse = await axios.get('/api/users');
          const users = usersResponse.data;
          
          setStats({
            totalUsers: users.length,
            activeUsers: users.filter(u => u.active).length,
            notifications: Math.floor(Math.random() * 10) // Random placeholder
          });
        } else {
          // Regular user just sees their own notifications
          setStats({
            totalUsers: 1,
            activeUsers: 1,
            notifications: Math.floor(Math.random() * 5) // Random placeholder
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  return (
    <DashboardContainer>
      <WelcomeSection>
        <h1>Welcome, {user.name || user.username}!</h1>
        <p>This is your {settings.bank_name || 'Evergreen Bank'} dashboard. Here you can manage your account and access banking features.</p>
      </WelcomeSection>
      
      <StatsGrid>
        {user.isAdmin && (
          <>
            <StatCard>
              <StatTitle>Total Users</StatTitle>
              <StatValue>{stats.totalUsers}</StatValue>
            </StatCard>
            <StatCard>
              <StatTitle>Active Users</StatTitle>
              <StatValue>{stats.activeUsers}</StatValue>
            </StatCard>
          </>
        )}
        <StatCard>
          <StatTitle>Notifications</StatTitle>
          <StatValue>{stats.notifications}</StatValue>
        </StatCard>
      </StatsGrid>
      
      <RecentActivity>
        <SectionTitle>Recent Activity</SectionTitle>
        <p>Your recent account activity will appear here.</p>
        {/* In a real application, you would map through recent activities */}
      </RecentActivity>
    </DashboardContainer>
  );
};

export default Dashboard;