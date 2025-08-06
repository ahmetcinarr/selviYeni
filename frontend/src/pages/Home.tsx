import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { FiShoppingCart, FiStar, FiTruck, FiShield, FiPhone, FiHeadphones } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;

  h1 {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    font-weight: 700;
    color: white;
    
    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }

  p {
    font-size: 1.3rem;
    margin-bottom: 2rem;
    color: rgba(255,255,255,0.9);
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

const CTAButton = styled(Link)`
  padding: 15px 30px;
  background: rgba(255,255,255,0.2);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.3);

  &:hover {
    background: rgba(255,255,255,0.3);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    color: white;
  }
`;

const FeaturesSection = styled.section`
  padding: 80px 0;
  background: white;
`;

const FeaturesGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: 40px 20px;
  border-radius: 16px;
  background: #f8f9fa;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }

  .icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #2c3e50;
  }

  p {
    color: #6c757d;
    line-height: 1.6;
  }
`;

const ProductsSection = styled.section`
  padding: 80px 0;
  background: #f8f9fa;
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 60px;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 15px;
    color: #2c3e50;
  }

  p {
    font-size: 1.2rem;
    color: #6c757d;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const ProductsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }
`;

const ProductImage = styled.div`
  height: 200px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const ProductInfo = styled.div`
  padding: 20px;

  h3 {
    font-size: 1.3rem;
    margin-bottom: 10px;
    color: #2c3e50;
    font-weight: 600;
  }

  .price {
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 15px;
  }

  .description {
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 20px;
    line-height: 1.5;
  }
`;

const ProductActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const AddToCartButton = styled.button`
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ViewDetailsButton = styled(Link)`
  padding: 12px 20px;
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

const StatsSection = styled.section`
  padding: 80px 0;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
`;

const StatsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  text-align: center;
`;

const StatCard = styled.div`
  h3 {
    font-size: 3rem;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 10px;
  }

  p {
    font-size: 1.2rem;
    color: rgba(255,255,255,0.8);
  }
`;

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_name: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products?limit=6`);
        if (response.data.success) {
          setFeaturedProducts(response.data.products);
        }
      } catch (error) {
        console.error('Öne çıkan ürünler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      alert('Sepete ürün eklemek için giriş yapmalısınız');
      return;
    }

    const result = await addToCart(productId, 1);
    if (result.success) {
      alert('Ürün sepete eklendi!');
    } else {
      alert(result.message);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div>
      <HeroSection>
        <HeroContent>
          <h1>Selvi GSM'e Hoş Geldiniz</h1>
          <p>
            Türkiye'nin en güvenilir GSM mağazası! En yeni telefon modelleri ve 
            aksesuarları için doğru adrestesiniz. Güvenli alışveriş, hızlı teslimat.
          </p>
          <CTAButtons>
            <CTAButton to="/products">Telefonlara Göz At</CTAButton>
            <CTAButton to="/accessories">Aksesuarları İncele</CTAButton>
          </CTAButtons>
        </HeroContent>
      </HeroSection>

      <FeaturesSection>
        <FeaturesGrid>
          <FeatureCard>
            <div className="icon">
              <FiTruck />
            </div>
            <h3>Ücretsiz Kargo</h3>
            <p>500₺ üzeri tüm siparişlerde ücretsiz kargo imkanı</p>
          </FeatureCard>
          <FeatureCard>
            <div className="icon">
              <FiShield />
            </div>
            <h3>Güvenli Alışveriş</h3>
            <p>SSL sertifikası ile korumalı, güvenli ödeme sistemi</p>
          </FeatureCard>
          <FeatureCard>
            <div className="icon">
              <FiHeadphones />
            </div>
            <h3>7/24 Destek</h3>
            <p>Uzman ekibimiz her zaman hizmetinizde</p>
          </FeatureCard>
          <FeatureCard>
            <div className="icon">
              <FiStar />
            </div>
            <h3>Orijinal Ürünler</h3>
            <p>%100 orijinal ve garantili ürünler</p>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <ProductsSection>
        <SectionTitle>
          <h2>Öne Çıkan Ürünler</h2>
          <p>En popüler telefon ve aksesuar modellerimizi keşfedin</p>
        </SectionTitle>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div className="loading-spinner" style={{ width: '50px', height: '50px' }}></div>
          </div>
        ) : (
          <ProductsGrid>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id}>
                <ProductImage>
                  <img 
                    src={product.image_url || 'https://via.placeholder.com/280x200?text=Ürün+Resmi'} 
                    alt={product.name}
                  />
                </ProductImage>
                <ProductInfo>
                  <h3>{product.name}</h3>
                  <div className="price">{formatPrice(product.price)}</div>
                  <div className="description">
                    {product.description?.substring(0, 100)}...
                  </div>
                  <ProductActions>
                    <AddToCartButton 
                      onClick={() => handleAddToCart(product.id)}
                      disabled={!isAuthenticated}
                    >
                      <FiShoppingCart size={16} />
                      Sepete Ekle
                    </AddToCartButton>
                    <ViewDetailsButton to={`/product/${product.id}`}>
                      Detay
                    </ViewDetailsButton>
                  </ProductActions>
                </ProductInfo>
              </ProductCard>
            ))}
          </ProductsGrid>
        )}

        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <CTAButton to="/products" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            Tüm Ürünleri Görüntüle
          </CTAButton>
        </div>
      </ProductsSection>

      <StatsSection>
        <StatsGrid>
          <StatCard>
            <h3>10K+</h3>
            <p>Mutlu Müşteri</p>
          </StatCard>
          <StatCard>
            <h3>500+</h3>
            <p>Ürün Çeşidi</p>
          </StatCard>
          <StatCard>
            <h3>4.8</h3>
            <p>Müşteri Memnuniyeti</p>
          </StatCard>
          <StatCard>
            <h3>24/7</h3>
            <p>Müşteri Desteği</p>
          </StatCard>
        </StatsGrid>
      </StatsSection>
    </div>
  );
};

export default Home;