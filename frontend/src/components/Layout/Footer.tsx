import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 50px 20px 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;

  @media (max-width: 768px) {
    padding: 30px 20px 20px;
    gap: 30px;
  }
`;

const FooterSection = styled.div`
  h3 {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 20px;
    color: #ecf0f1;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 40px;
      height: 2px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 1px;
    }
  }

  p {
    line-height: 1.6;
    color: #bdc3c7;
    margin-bottom: 15px;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 10px;
  }
`;

const FooterLink = styled(Link)`
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: #667eea;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  color: #bdc3c7;

  svg {
    color: #667eea;
    flex-shrink: 0;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background: #667eea;
    transform: translateY(-2px);
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 20px 0;
  text-align: center;
  color: #95a5a6;
  font-size: 0.9rem;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 10px;
    }
  }
`;

const PaymentMethods = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  span {
    font-size: 0.8rem;
    margin-right: 10px;
  }

  .payment-icon {
    background: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #333;
    font-weight: bold;
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>Selvi GSM</h3>
          <p>
            Türkiye'nin en güvenilir GSM mağazası olarak 2020 yılından beri 
            müşterilerimize en kaliteli ürünleri ve hizmeti sunuyoruz.
          </p>
          <SocialLinks>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer">
              <FiFacebook size={18} />
            </SocialLink>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer">
              <FiInstagram size={18} />
            </SocialLink>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer">
              <FiTwitter size={18} />
            </SocialLink>
          </SocialLinks>
        </FooterSection>

        <FooterSection>
          <h3>Hızlı Linkler</h3>
          <ul>
            <li>
              <FooterLink to="/">Ana Sayfa</FooterLink>
            </li>
            <li>
              <FooterLink to="/products">Telefonlar</FooterLink>
            </li>
            <li>
              <FooterLink to="/accessories">Aksesuarlar</FooterLink>
            </li>
            <li>
              <FooterLink to="/about">Hakkımızda</FooterLink>
            </li>
            <li>
              <FooterLink to="/kvkk">KVKK</FooterLink>
            </li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h3>Müşteri Hizmetleri</h3>
          <ul>
            <li>
              <FooterLink to="/contact">İletişim</FooterLink>
            </li>
            <li>
              <FooterLink to="/shipping">Kargo Bilgileri</FooterLink>
            </li>
            <li>
              <FooterLink to="/returns">İade & Değişim</FooterLink>
            </li>
            <li>
              <FooterLink to="/warranty">Garanti Koşulları</FooterLink>
            </li>
            <li>
              <FooterLink to="/faq">Sık Sorulan Sorular</FooterLink>
            </li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h3>İletişim</h3>
          <ContactItem>
            <FiMapPin size={18} />
            <span>Ankara, Türkiye</span>
          </ContactItem>
          <ContactItem>
            <FiPhone size={18} />
            <span>+90 312 XXX XX XX</span>
          </ContactItem>
          <ContactItem>
            <FiMail size={18} />
            <span>info@selvigsm.com</span>
          </ContactItem>
          <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
            <strong>Çalışma Saatleri:</strong><br />
            Pazartesi - Cumartesi: 09:00 - 18:00<br />
            Pazar: 10:00 - 16:00
          </p>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <div className="container">
          <div>
            © 2024 Selvi GSM. Tüm hakları saklıdır.
          </div>
          <PaymentMethods>
            <span>Ödeme Yöntemleri:</span>
            <div className="payment-icon">VISA</div>
            <div className="payment-icon">MC</div>
            <div className="payment-icon">AMEX</div>
            <div className="payment-icon">TROY</div>
          </PaymentMethods>
        </div>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;