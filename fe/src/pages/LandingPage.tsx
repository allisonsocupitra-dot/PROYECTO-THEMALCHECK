import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/img/Themalcheck-logo.svg';
import '../styles/landing.css';

const LandingPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link className="landing-brand" to="/" aria-label="ThemalCheck">
          <img src={logo} alt="" />
          <span>ThemalCheck</span>
        </Link>
        <Link className="landing-login-link" to="/auth">
          {t('landing.iniciar')}
        </Link>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-eyebrow">{t('landing.etiqueta')}</p>
          <h1>Themal<span>Check</span></h1>
          <p className="landing-description">{t('landing.descripcion')}</p>
          <Link className="landing-cta" to="/auth">
            {t('landing.comenzar')} <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>

        <div className="thermal-preview" aria-hidden="true">
          <div className="thermal-grid" />
          <div className="thermal-crosshair" />
          <div className="thermal-label thermal-label-top">42.8 C</div>
          <div className="thermal-label thermal-label-bottom">ANALYSIS READY</div>
          <div className="thermal-scale"><i /><i /><i /><i /><i /></div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>{t('landing.pie')}</span>
        <span className="landing-status"><i /> {t('landing.estado')}</span>
      </footer>
    </main>
  );
};

export default LandingPage;