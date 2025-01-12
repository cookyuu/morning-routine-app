// src/components/Header.tsx
import React from 'react';
import '../styles/Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src="/vite.svg" alt="App Logo" />
          {/* <img src="/moring-rountine-logo.svg" alt="App Logo" /> */}
        </div>
        <nav className="nav">
          <ul>
            <li><a href="#about">서비스 소개</a></li>
            <li><a href="#news">공지사항</a></li>
            <li><a href="#support">요청사항</a></li>
            <li><a href="#faq">자주묻는 질문</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;