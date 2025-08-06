import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const TopBar = styled.div`
  background: rgba(0,0,0,0.1);
  padding: 8px 0;
  font-size: 0.9rem;
  text-align: center;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: #f0f0f0;
  }
`;

const Nav = styled.nav<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 30px;

  @media (max-width: 768px) {
    position: fixed;
    top: 70px;
    left: 0;
    width: 100%;
    height: calc(100vh - 70px);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 50px;
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    transition: transform 0.3s ease-in-out;
  }
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba(255,255,255,0.1);
    transform: translateY(-1px);
  }

  ${props => props.$isActive && `
    background: rgba(255,255,255,0.2);
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: white;
      border-radius: 1px;
    }
  `}

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 15px 20px;
    width: 100%;
    text-align: center;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    margin: 20px;
  }
`;

const SearchInput = styled.input`
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 25px;
  padding: 8px 40px 8px 16px;
  color: white;
  font-size: 0.9rem;
  width: 250px;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255,255,255,0.7);
  }

  &:focus {
    outline: none;
    background: rgba(255,255,255,0.3);
    border-color: rgba(255,255,255,0.5);
    width: 300px;
  }

  @media (max-width: 768px) {
    width: 100%;
    &:focus {
      width: 100%;
    }
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255,255,255,0.2);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255,255,255,0.2);
    transform: translateY(-1px);
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  min-width: 200px;
  padding: 8px 0;
  transform: ${props => props.$isOpen ? 'translateY(8px)' : 'translateY(0)'};
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  z-index: 1000;
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 12px 20px;
  color: #333;
  text-decoration: none;
  transition: background 0.3s ease;

  &:hover {
    background: #f8f9fa;
  }
`;

const DropdownButton = styled.button`
  display: block;
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  color: #333;
  text-align: left;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #f8f9fa;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <HeaderContainer>
      <TopBar>
        📱 Türkiye'nin En Güvenilir GSM Mağazası - Ücretsiz Kargo 500₺ Üzeri Siparişlerde!
      </TopBar>
      <NavContainer>
        <Logo to="/">
          📱 Selvi GSM
        </Logo>

        <Nav $isOpen={mobileMenuOpen}>
          <NavLink 
            to="/" 
            $isActive={isActivePath('/')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Ana Sayfa
          </NavLink>
          <NavLink 
            to="/products" 
            $isActive={isActivePath('/products')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Telefonlar
          </NavLink>
          <NavLink 
            to="/accessories" 
            $isActive={isActivePath('/accessories')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Aksesuarlar
          </NavLink>
          <NavLink 
            to="/about" 
            $isActive={isActivePath('/about')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Hakkımızda
          </NavLink>

          <SearchContainer>
            <form onSubmit={handleSearch}>
              <SearchInput
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchButton type="submit">
                <FiSearch size={16} />
              </SearchButton>
            </form>
          </SearchContainer>
        </Nav>

        <RightSection>
          {isAuthenticated && (
            <IconButton onClick={() => navigate('/cart')}>
              <FiShoppingCart size={20} />
              {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
            </IconButton>
          )}

          <UserMenu>
            <IconButton onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <FiUser size={20} />
            </IconButton>
            <UserDropdown $isOpen={userMenuOpen}>
              {isAuthenticated ? (
                <>
                  <div style={{ padding: '12px 20px', borderBottom: '1px solid #eee', fontSize: '0.9rem', color: '#666' }}>
                    Merhaba, {user?.firstName}
                  </div>
                  <DropdownItem to="/account" onClick={() => setUserMenuOpen(false)}>
                    Hesabım
                  </DropdownItem>
                  {isAdmin && (
                    <DropdownItem to="/admin" onClick={() => setUserMenuOpen(false)}>
                      Admin Paneli
                    </DropdownItem>
                  )}
                  <DropdownButton onClick={handleLogout}>
                    Çıkış Yap
                  </DropdownButton>
                </>
              ) : (
                <>
                  <DropdownItem to="/login" onClick={() => setUserMenuOpen(false)}>
                    Giriş Yap
                  </DropdownItem>
                  <DropdownItem to="/register" onClick={() => setUserMenuOpen(false)}>
                    Kayıt Ol
                  </DropdownItem>
                </>
              )}
            </UserDropdown>
          </UserMenu>

          <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </MobileMenuButton>
        </RightSection>
      </NavContainer>
    </HeaderContainer>
  );
};

export default Header;