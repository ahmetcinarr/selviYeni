import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 200px);
`;

const ComingSoon = styled.div`
  text-align: center;
  padding: 100px 20px;
  
  h2 {
    font-size: 2rem;
    color: #667eea;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.2rem;
    color: #6c757d;
  }
`;

const Cart: React.FC = () => {
  return (
    <Container>
      <ComingSoon>
        <h2>🛒 Sepetim</h2>
        <p>Bu sayfa henüz geliştirilme aşamasında. En kısa sürede hizmetinizde olacağız.</p>
      </ComingSoon>
    </Container>
  );
};

export default Cart;