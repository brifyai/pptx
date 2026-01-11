import { useState, useEffect, useRef } from 'react'
import '../styles/Landing.css'

function Landing({ onGetStarted }) {
  const [showVideo, setShowVideo] = useState(false)
  const [visibleSections, setVisibleSections] = useState({})
  const statsRef = useRef(null)
  const [statsAnimated, setStatsAnimated] = useState(false)
  const [counters, setCounters] = useState({ users: 0, presentations: 0, satisfaction: 0, time: 0 })

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleNavigation = (mode) => {
    onGetStarted(mode)
  }

  // Intersection Observer para animaciones al scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  // Animación de contadores
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsAnimated) {
          setStatsAnimated(true)
          animateCounters()
        }
      },
      { threshold: 0.5 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => observer.disconnect()
  }, [statsAnimated])

  const animateCounters = () => {
    const targets = { users: 2500, presentations: 50000, satisfaction: 98, time: 10 }
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      setCounters({
        users: Math.round(targets.users * easeOut),
        presentations: Math.round(targets.presentations * easeOut),
        satisfaction: Math.round(targets.satisfaction * easeOut),
        time: Math.round(targets.time * easeOut)
      })

      if (step >= steps) clearInterval(timer)
    }, interval)
  }

  return (
    <div className="landing">
      {/* Header Glassmorphism */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-landing">
            <span>SlideAI</span>
          </div>
          <nav className="landing-nav">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features') }}>Features</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works') }}>Cómo Funciona</a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing') }}>Pricing</a>
          </nav>
          <div className="header-buttons">
            <button className="btn-login" onClick={() => handleNavigation('login')}>Acceder</button>
            <button className="btn-cta-header" onClick={() => handleNavigation('register')}>Empezar Gratis</button>
          </div>
        </div>
      </header>

      {/* Hero Section - Bento Grid */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-bento">
            {/* Card Principal */}
            <div className="bento-main">
              <div className="hero-badge">
                <span className="pulse"></span>
                Nuevo: Preservación de animaciones
              </div>
              <h1 className="hero-title">
                Tu Template.<br/>
                <span className="highlight">Tu Marca.</span><br/>
                Nuestra IA.
              </h1>
              <p className="hero-subtitle">
                La única herramienta que respeta tu identidad corporativa al 100%. 
                Sube tu PPTX y genera contenido sin perder logos, colores ni animaciones.
              </p>
              <div className="hero-ctas">
                <button className="btn-primary-large" onClick={() => handleNavigation('register')}>
                  <span className="material-icons">rocket_launch</span>
                  Comenzar Gratis
                </button>
                <button className="btn-secondary-large" onClick={() => setShowVideo(true)}>
                  <span className="material-icons">play_circle</span>
                  Ver Demo
                </button>
              </div>
            </div>

            {/* Preview Mockup - Ultra Realista */}
            <div className="bento-preview">
              <div className="preview-mockup">
                <div className="mockup-header">
                  <div className="mockup-dots">
                    <span className="mockup-dot"></span>
                    <span className="mockup-dot"></span>
                    <span className="mockup-dot"></span>
                  </div>
                  <div className="mockup-tabs">
                    <span className="tab active">Presentación.pptx</span>
                  </div>
                  <span className="mockup-title">SlideAI Editor</span>
                </div>
                <div className="mockup-toolbar">
                  <div className="toolbar-left">
                    <span className="material-icons">menu</span>
                    <span className="material-icons">undo</span>
                    <span className="material-icons">redo</span>
                  </div>
                  <div className="toolbar-center">
                    <span className="material-icons">format_bold</span>
                    <span className="material-icons">format_italic</span>
                    <span className="material-icons">format_align_left</span>
                    <span className="material-icons">image</span>
                  </div>
                  <div className="toolbar-right">
                    <button className="export-btn">
                      <span className="material-icons">download</span>
                      Exportar
                    </button>
                  </div>
                </div>
                <div className="mockup-content">
                  <div className="mockup-sidebar">
                    <div className="mockup-thumb active">
                      <div className="thumb-slide">
                        <div className="mini-title"></div>
                        <div className="mini-text"></div>
                        <div className="mini-logo"></div>
                      </div>
                      <span className="thumb-number">1</span>
                    </div>
                    <div className="mockup-thumb">
                      <div className="thumb-slide alt">
                        <div className="mini-chart"></div>
                        <div className="mini-text"></div>
                      </div>
                      <span className="thumb-number">2</span>
                    </div>
                    <div className="mockup-thumb">
                      <div className="thumb-slide">
                        <div className="mini-bullets">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                      <span className="thumb-number">3</span>
                    </div>
                    <div className="add-slide">
                      <span className="material-icons">add</span>
                    </div>
                  </div>
                  <div className="mockup-main">
                    <div className="mockup-slide">
                      <div className="slide-brand">
                        <div className="brand-logo">
                          <span className="material-icons">business</span>
                        </div>
                        <span className="brand-name">ACME Corp</span>
                      </div>
                      <div className="slide-title-real">Estrategia Digital 2025</div>
                      <div className="slide-subtitle-real">Transformación e Innovación</div>
                      <div className="slide-content-real">
                        <div className="content-line"></div>
                        <div className="content-line short"></div>
                        <div className="content-line medium"></div>
                      </div>
                      <div className="slide-footer">
                        <span>Confidencial</span>
                        <span>Enero 2025</span>
                      </div>
                    </div>
                  </div>
                  <div className="mockup-chat">
                    <div className="chat-header">
                      <span className="material-icons">psychology</span>
                      Asistente IA
                    </div>
                    <div className="chat-messages">
                      <div className="chat-msg user">
                        <p>Genera contenido para slide de estrategia</p>
                      </div>
                      <div className="chat-msg ai">
                        <p>He generado 3 puntos clave manteniendo tu diseño corporativo...</p>
                        <div className="typing-indicator">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                    <div className="chat-input">
                      <input type="text" placeholder="Escribe tu prompt..." disabled />
                      <span className="material-icons">send</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mockup-glow"></div>
            </div>

            {/* Stats Cards */}
            <div className="bento-stat">
              <div className="stat-icon">
                <span className="material-icons">speed</span>
              </div>
              <div>
                <div className="stat-value">10x</div>
                <div className="stat-label">Más rápido que manual</div>
              </div>
            </div>

            <div className="bento-stat">
              <div className="stat-icon purple">
                <span className="material-icons">verified</span>
              </div>
              <div>
                <div className="stat-value">100%</div>
                <div className="stat-label">Preservación de diseño</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Marquee de Logos */}
      <section className="social-proof">
        <div className="social-proof-inner">
          <p className="social-proof-text">Empresas que confían en nosotros</p>
          <div className="logo-marquee">
            <div className="logo-track">
              <div className="company-logo">Microsoft</div>
              <div className="company-logo">Google</div>
              <div className="company-logo">Amazon</div>
              <div className="company-logo">Meta</div>
              <div className="company-logo">Apple</div>
              <div className="company-logo">Netflix</div>
              <div className="company-logo">Spotify</div>
              <div className="company-logo">Airbnb</div>
              <div className="company-logo">Microsoft</div>
              <div className="company-logo">Google</div>
              <div className="company-logo">Amazon</div>
              <div className="company-logo">Meta</div>
              <div className="company-logo">Apple</div>
              <div className="company-logo">Netflix</div>
              <div className="company-logo">Spotify</div>
              <div className="company-logo">Airbnb</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section con Contadores Animados */}
      <section className="stats-section" ref={statsRef}>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{counters.users.toLocaleString()}+</div>
            <div className="stat-label">Usuarios Activos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{counters.presentations.toLocaleString()}+</div>
            <div className="stat-label">Presentaciones Creadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{counters.satisfaction}%</div>
            <div className="stat-label">Satisfacción</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{counters.time}x</div>
            <div className="stat-label">Más Rápido</div>
          </div>
        </div>
      </section>

      {/* How It Works - Horizontal Cards */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <div className="section-tag">
            <span className="material-icons">auto_fix_high</span>
            Simple y Poderoso
          </div>
          <h2 className="section-title">Cómo Funciona</h2>
          <p className="section-subtitle">
            3 pasos para crear presentaciones que respetan tu marca
          </p>
        </div>

        <div className="steps-horizontal">
          <div className="step-card">
            <div className="step-badge">1</div>
            <div className="step-icon-wrap">
              <span className="material-icons">upload_file</span>
            </div>
            <h3>Sube Tu Template</h3>
            <p>Arrastra tu archivo PPTX corporativo con tu diseño original.</p>
          </div>

          <div className="step-arrow">
            <span className="material-icons">trending_flat</span>
          </div>

          <div className="step-card">
            <div className="step-badge">2</div>
            <div className="step-icon-wrap">
              <span className="material-icons">psychology</span>
            </div>
            <h3>IA Analiza y Genera</h3>
            <p>Detectamos tu estructura y generamos contenido que encaja perfecto.</p>
          </div>

          <div className="step-arrow">
            <span className="material-icons">trending_flat</span>
          </div>

          <div className="step-card">
            <div className="step-badge">3</div>
            <div className="step-icon-wrap">
              <span className="material-icons">download</span>
            </div>
            <h3>Exporta Idéntico</h3>
            <p>Descarga tu PPTX con contenido nuevo y diseño 100% intacto.</p>
          </div>
        </div>
      </section>

      {/* Features - Grid uniforme */}
      <section id="features" className="features">
        <div className="section-header">
          <div className="section-tag">
            <span className="material-icons">stars</span>
            Diferenciadores
          </div>
          <h2 className="section-title">¿Por Qué Somos Diferentes?</h2>
          <p className="section-subtitle">
            Otras herramientas te obligan a usar sus templates. Nosotros preservamos el tuyo.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-icons">verified</span>
            </div>
            <h3>100% Tu Diseño</h3>
            <p>Preservamos logos, colores, fuentes, animaciones y layouts. Sin excepciones.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-icons">bolt</span>
            </div>
            <h3>10x Más Rápido</h3>
            <p>Genera contenido en segundos mientras mantiene tu diseño intacto.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-icons">animation</span>
            </div>
            <h3>Animaciones Intactas</h3>
            <p>Tus transiciones y efectos se preservan exactamente como los diseñaste.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-icons">compare</span>
            </div>
            <h3>Vs. Competencia</h3>
            <p>Gamma y Beautiful.ai te dan templates genéricos. Nosotros usamos el TUYO.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-icons">business</span>
            </div>
            <h3>Para Empresas</h3>
            <p>Brand guidelines estrictos? Esta es tu herramienta.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-icons">security</span>
            </div>
            <h3>Datos Seguros</h3>
            <p>Procesamiento seguro. Tu contenido bajo tu control.</p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="comparison-section">
        <div className="section-header">
          <div className="section-tag">
            <span className="material-icons">compare_arrows</span>
            Comparación
          </div>
          <h2 className="section-title">¿Qué Hace Diferente a SlideAI?</h2>
          <p className="section-subtitle">
            Basado en documentación oficial y pruebas reales
          </p>
        </div>

        <div className="comparison-table">
          <div className="comparison-header">
            <div className="comparison-feature">Característica</div>
            <div className="comparison-us">
              <span className="our-logo">SlideAI</span>
            </div>
            <div className="comparison-them">Gamma</div>
            <div className="comparison-them">Beautiful.ai</div>
            <div className="comparison-them">Pitch</div>
          </div>
          
          <div className="comparison-row">
            <div className="comparison-feature">Edita tu PPTX sin convertirlo</div>
            <div className="comparison-us"><span className="check">✓</span></div>
            <div className="comparison-them"><span className="cross">✗</span></div>
            <div className="comparison-them"><span className="cross">✗</span></div>
            <div className="comparison-them"><span className="partial">~</span></div>
          </div>
          
          <div className="comparison-row">
            <div className="comparison-feature">Preserva animaciones y transiciones</div>
            <div className="comparison-us"><span className="check">✓</span></div>
            <div className="comparison-them"><span className="cross">✗</span></div>
            <div className="comparison-them"><span className="cross">✗</span></div>
            <div className="comparison-them"><span className="cross">✗</span></div>
          </div>
          
          <div className="comparison-row">
            <div className="comparison-feature">Detecta colores y fuentes de marca</div>
            <div className="comparison-us"><span className="check">✓</span></div>
            <div className="comparison-them"><span className="check">✓</span></div>
            <div className="comparison-them"><span className="check">✓</span></div>
            <div className="comparison-them"><span className="partial">~</span></div>
          </div>
          
          <div className="comparison-row">
            <div className="comparison-feature">Export PPTX sin pérdida de formato</div>
            <div className="comparison-us"><span className="check">✓</span></div>
            <div className="comparison-them"><span className="partial">~</span></div>
            <div className="comparison-them"><span className="partial">~</span></div>
            <div className="comparison-them"><span className="partial">~</span></div>
          </div>
          
          <div className="comparison-row highlight-row">
            <div className="comparison-feature">Usa TU template, no los suyos</div>
            <div className="comparison-us"><span className="check">✓</span></div>
            <div className="comparison-them"><span className="cross">✗</span></div>
            <div className="comparison-them"><span className="cross">✗</span></div>
            <div className="comparison-them"><span className="cross">✗</span></div>
          </div>
        </div>

        <div className="comparison-legend">
          <span><span className="check">✓</span> Soportado</span>
          <span><span className="partial">~</span> Parcial/Limitado</span>
          <span><span className="cross">✗</span> No soportado</span>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <div className="section-tag">
            <span className="material-icons">format_quote</span>
            Testimonios
          </div>
          <h2 className="section-title">Lo Que Dicen Nuestros Usuarios</h2>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <div className="stars">★★★★★</div>
              <p>"Finalmente una herramienta que respeta nuestro brand guidelines. Subimos nuestro template corporativo y la IA genera contenido sin tocar nuestro diseño."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">MR</div>
              <div className="author-info">
                <div className="author-name">María Rodríguez</div>
                <div className="author-role">Directora de Marketing, TechCorp</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card featured">
            <div className="testimonial-content">
              <div className="stars">★★★★★</div>
              <p>"Probamos Gamma y Beautiful.ai pero ninguno preservaba nuestras animaciones. SlideAI es el único que mantiene todo exactamente como lo diseñamos."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">CL</div>
              <div className="author-info">
                <div className="author-name">Carlos López</div>
                <div className="author-role">CEO, Innovate Solutions</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-content">
              <div className="stars">★★★★★</div>
              <p>"Ahorramos 15 horas semanales en creación de presentaciones. La IA entiende nuestro estilo y genera contenido que parece hecho por nuestro equipo."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">AS</div>
              <div className="author-info">
                <div className="author-name">Ana Sánchez</div>
                <div className="author-role">Head of Design, GlobalBrand</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing">
        <div className="section-header">
          <div className="section-tag">
            <span className="material-icons">payments</span>
            Pricing
          </div>
          <h2 className="section-title">Planes Simples</h2>
          <p className="section-subtitle">
            Sin sorpresas. Cancela cuando quieras.
          </p>
        </div>

        <div className="pricing-cards">
          <div className="pricing-card">
            <h3>Starter</h3>
            <p className="plan-desc">Para probar la herramienta</p>
            <div className="price">
              <span className="amount">$0</span>
              <span className="period">/mes</span>
            </div>
            <ul className="features-list">
              <li><span className="material-icons">check</span> 5 presentaciones/mes</li>
              <li><span className="material-icons">check</span> Exportar a PPTX</li>
              <li><span className="material-icons">check</span> Preservación básica</li>
              <li><span className="material-icons close">close</span> Sin soporte prioritario</li>
            </ul>
            <button className="btn-pricing" onClick={() => handleNavigation('register')}>
              Comenzar Gratis
            </button>
          </div>

          <div className="pricing-card featured">
            <div className="popular-badge">Popular</div>
            <h3>Pro</h3>
            <p className="plan-desc">Para profesionales</p>
            <div className="price">
              <span className="amount">$29</span>
              <span className="period">/mes</span>
            </div>
            <ul className="features-list">
              <li><span className="material-icons">check</span> Ilimitadas presentaciones</li>
              <li><span className="material-icons">check</span> Todos los formatos</li>
              <li><span className="material-icons">check</span> Preservación completa</li>
              <li><span className="material-icons">check</span> Soporte prioritario</li>
            </ul>
            <button className="btn-pricing primary" onClick={() => handleNavigation('register')}>
              Comenzar Ahora
            </button>
          </div>

          <div className="pricing-card">
            <h3>Enterprise</h3>
            <p className="plan-desc">Para equipos grandes</p>
            <div className="price">
              <span className="amount">Custom</span>
            </div>
            <ul className="features-list">
              <li><span className="material-icons">check</span> Todo de Pro</li>
              <li><span className="material-icons">check</span> API personalizada</li>
              <li><span className="material-icons">check</span> SSO & seguridad</li>
              <li><span className="material-icons">check</span> SLA garantizado</li>
            </ul>
            <button className="btn-pricing" onClick={() => handleNavigation('contact')}>
              Contactar
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="section-header">
          <div className="section-tag">
            <span className="material-icons">help_outline</span>
            FAQ
          </div>
          <h2 className="section-title">Preguntas Frecuentes</h2>
        </div>

        <div className="faq-list">
          <details className="faq-item">
            <summary>¿Necesito conocimientos técnicos?</summary>
            <p>No, la interfaz es intuitiva. Solo arrastra tu PPTX y la IA hace el resto. No necesitas saber programar ni diseñar.</p>
          </details>
          <details className="faq-item">
            <summary>¿Mis datos están seguros?</summary>
            <p>Sí, todos tus archivos se procesan de forma segura. No almacenamos tu contenido más allá de lo necesario para el procesamiento.</p>
          </details>
          <details className="faq-item">
            <summary>¿Qué hace diferente a esta herramienta?</summary>
            <p>A diferencia de Gamma, Beautiful.ai o Pitch, nosotros NO te damos templates genéricos. Usamos TU template y preservamos 100% tu diseño.</p>
          </details>
          <details className="faq-item">
            <summary>¿Funciona con cualquier template PPTX?</summary>
            <p>Sí, soportamos cualquier archivo PPTX estándar de PowerPoint, incluyendo animaciones, transiciones y elementos multimedia.</p>
          </details>
          <details className="faq-item">
            <summary>¿Puedo cancelar en cualquier momento?</summary>
            <p>Sí, sin compromisos. Cancela cuando quieras desde tu panel de control y no se te cobrará más.</p>
          </details>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="final-cta-inner">
          <h2>Empieza a Crear con Tu Marca</h2>
          <p>
            Únete a miles de profesionales que ya crean presentaciones 
            manteniendo su identidad corporativa intacta.
          </p>
          <button className="btn-primary-large" onClick={() => handleNavigation('register')}>
            <span className="material-icons">rocket_launch</span>
            Comenzar Gratis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo-landing">
              <span>SlideAI</span>
            </div>
            <p>La única herramienta de presentaciones que respeta tu identidad corporativa al 100%.</p>
          </div>
          <div className="footer-section">
            <h4>Producto</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#how-it-works">Cómo Funciona</a>
          </div>
          <div className="footer-section">
            <h4>Recursos</h4>
            <a href="#">Blog</a>
            <a href="#">Docs</a>
            <a href="#">Tutoriales</a>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
            <a href="#">Cookies</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 SlideAI. Todos los derechos reservados.</p>
          <div className="footer-social">
            <a href="#"><span className="material-icons">language</span></a>
            <a href="#"><span className="material-icons">alternate_email</span></a>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div className="video-modal" onClick={() => setShowVideo(false)}>
          <div className="video-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowVideo(false)}>
              <span className="material-icons">close</span>
            </button>
            <div className="video-placeholder">
              <span className="material-icons">play_circle</span>
              <p>Video demo próximamente</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Landing
