import React from 'react';
import { useBranding } from './BrandingProvider';
import styled from 'styled-components';

const EmailContainer = styled.div`
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
`;

const EmailHeader = styled.div`
  background-color: var(--primary-color, #1e4620);
  color: white;
  padding: 20px;
  text-align: center;
`;

const EmailBody = styled.div`
  padding: 20px;
  background-color: #fff;
`;

const EmailFooter = styled.div`
  background-color: #f5f5f5;
  padding: 15px;
  text-align: center;
  font-size: 12px;
  color: #666;
`;

const EmailTemplate = ({ subject, children }) => {
  const branding = useBranding();
  
  return (
    <EmailContainer>
      <EmailHeader>
        <h2>{branding.bankName}</h2>
        <div>{subject}</div>
      </EmailHeader>
      
      <EmailBody>
        {children}
      </EmailBody>
      
      <EmailFooter>
        <p>© {new Date().getFullYear()} {branding.bankName}</p>
        <p>{branding.address}</p>
        <p>Contact: {branding.supportEmail} | {branding.phone}</p>
      </EmailFooter>
    </EmailContainer>
  );
};

export default EmailTemplate;