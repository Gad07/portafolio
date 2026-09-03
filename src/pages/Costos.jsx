import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FiCheck,
  FiZap,
  FiLayers,
  FiShield,
  FiSliders,
  FiSend,
  FiDollarSign,
  FiAward,
  FiArrowRight,
  FiSmartphone,
  FiShoppingCart,
  FiCpu,
  FiFileText,
  FiBox,
  FiServer,
  FiDatabase,
  FiSearch,
  FiGlobe,
  FiCreditCard
} from 'react-icons/fi'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
})

const USD_RATE = 19.5

// ─── TABULADOR OFICIAL 2026 ───────────────────────────────────────────────────
const officialServices = [
  {
    id: 'landing',
    category: 'web',
    categoryLabel: 'Sitios Web',
    name: 'Landing Page / One-Page',
    baseMXN: 3000,
    priceDisplay: '$3,000.00 MXN',
    priceDisplayUSD: '$155.00 USD',
    scope: 'Brochure digital fluido de una sola página con scroll de secciones de alta conversión.',
    example: 'Página de registro para un Taller de IA, portafolio personal express o lanzamiento de producto.',
    icon: <FiZap />,
    includesPaymentGateway: false,
  },
  {
    id: 'basic_web',
    category: 'web',
    categoryLabel: 'Sitios Web',
    name: 'Sitio Web Básico (hasta 5 secciones)',
    baseMXN: 8000,
    priceDisplay: '$8,000.00 MXN',
    priceDisplayUSD: '$410.00 USD',
    scope: 'Web institucional completa y responsive con estructura estándar.',
    example: 'Sitio para PyME local con secciones: Inicio, Nosotros, Servicios/Galería y Contacto con WhatsApp.',
    icon: <FiLayers />,
    includesPaymentGateway: false,
  },
  {
    id: 'corp_web',
    category: 'web',
    categoryLabel: 'Sitios Web',
    name: 'Sitio Web Corporativo (5 a 15 secciones)',
    baseMXN: 14000,
    priceDisplay: '$14,000.00 MXN',
    priceDisplayUSD: '$720.00 USD',
    scope: 'Portal empresarial estructurado para posicionamiento SEO local y captación de prospectos.',
    example: 'Páginas dedicadas para cada servicio especializado, blog corporativo y casos de éxito.',
    icon: <FiFileText />,
    includesPaymentGateway: false,
  },
  {
    id: 'complex_corp',
    category: 'web',
    categoryLabel: 'Sitios Web',
    name: 'Sitio Web Corporativo Complejo (16+ secciones)',
    baseMXN: 14000,
    extraPerSection: 500,
    priceDisplay: '$14,000.00 base (+ $500/sección extra)',
    priceDisplayUSD: '$720.00 base (+ $25/sección)',
    scope: 'Ecosistema corporativo masivo con múltiples departamentos y jerarquías.',
    example: 'Portales de múltiples sucursales, directorios extensos o catálogos corporativos sin pasarela.',
    icon: <FiBox />,
    includesPaymentGateway: false,
  },
  {
    id: 'ecommerce_std',
    category: 'ecommerce',
    categoryLabel: 'E-Commerce',
    name: 'E-commerce Estándar',
    baseMXN: 14000,
    priceDisplay: '$14,000.00 MXN',
    priceDisplayUSD: '$720.00 USD',
    scope: 'Tienda en línea comercial para venta de productos físicos o digitales con pasarelas.',
    example: 'Tienda de ropa, artículos o cursos con carrito de compras y pagos con Stripe / Mercado Pago / PayPal.',
    icon: <FiShoppingCart />,
    includesPaymentGateway: true,
  },
  {
    id: 'ecommerce_adv',
    category: 'ecommerce',
    categoryLabel: 'E-Commerce',
    name: 'E-commerce Avanzado',
    baseMXN: 18000,
    priceDisplay: '$18,000.00 MXN (+ timbres facturación)',
    priceDisplayUSD: '$925.00 USD (+ timbres)',
    scope: 'Plataforma de venta masiva con sincronización de inventario en tiempo real y facturación SAT.',
    example: 'Tienda de alto volumen con cálculo automatizado de envíos por paquetería y timbrado fiscal.',
    icon: <FiShoppingCart />,
    includesPaymentGateway: true,
  },
  {
    id: 'pos_system',
    category: 'systems',
    categoryLabel: 'Sistemas & ERPs',
    name: 'Sistema POS / Punto de Venta',
    baseMXN: 18000,
    priceDisplay: '$18,000.00 MXN',
    priceDisplayUSD: '$925.00 USD',
    scope: 'Punto de venta web para registrar transacciones diarias en mostrador.',
    example: 'Emisión de tickets de compra, control de cortes de caja (apertura/cierre) e inventario en piso.',
    icon: <FiServer />,
    includesPaymentGateway: true,
  },
  {
    id: 'crm_custom',
    category: 'systems',
    categoryLabel: 'Sistemas & ERPs',
    name: 'Sistema CRM a la Medida',
    baseMXN: 17000,
    priceDisplay: '$17,000.00 MXN',
    priceDisplayUSD: '$870.00 USD',
    scope: 'Panel especializado para seguimiento comercial y embudos de conversión.',
    example: 'Asignación de prospectos a ejecutivos de ventas, historial de llamadas, cotizaciones y métricas de cierre.',
    icon: <FiDatabase />,
    includesPaymentGateway: true,
  },
  {
    id: 'erp_custom',
    category: 'systems',
    categoryLabel: 'Sistemas & ERPs',
    name: 'Sistema ERP a la Medida',
    baseMXN: 15000,
    priceDisplay: '$15,000.00 MXN',
    priceDisplayUSD: '$770.00 USD',
    scope: 'Plataforma centralizada para la administración de recursos empresariales.',
    example: 'Control de inventarios de almacén, compras a proveedores y flujos de caja internos.',
    icon: <FiCpu />,
    includesPaymentGateway: true,
  },
  {
    id: 'mobile_app',
    category: 'apps',
    categoryLabel: 'Apps & SaaS',
    name: 'Aplicación Móvil (iOS / Android)',
    baseMXN: 15000,
    priceDisplay: 'Cotización sobre diseño (Base: $15,000.00+ MXN)',
    priceDisplayUSD: 'Custom Quote (Base: $770.00+ USD)',
    scope: 'Desarrollo de apps nativas o híbridas con React Native y backend conectado.',
    example: 'App de reparto a domicilio, fidelización con códigos QR o plataformas con geolocalización.',
    icon: <FiSmartphone />,
    includesPaymentGateway: true,
  },
  {
    id: 'saas_platform',
    category: 'apps',
    categoryLabel: 'Apps & SaaS',
    name: 'Plataforma Web Avanzada / SaaS',
    baseMXN: 20000,
    priceDisplay: 'Cotización sobre diseño (Base: $20,000.00+ MXN)',
    priceDisplayUSD: 'Custom Quote (Base: $1,025.00+ USD)',
    scope: 'Software como servicio (SaaS) con arquitecturas de alta concurrencia.',
    example: 'Sistema escolar interactivo (LMS) para cursos, plataformas de membresías o software logístico.',
    icon: <FiSliders />,
    includesPaymentGateway: true,
  },
]

// ─── TODOS LOS MÓDULOS DEL COTIZADOR ───────────────────────────────────────────
const allAddOns = [
  { id: 'cms', label: 'Panel CMS Administrable a la medida', basePrice: 1500, icon: <FiSliders /> },
  { id: 'auth', label: 'Autenticación Segura (OAuth / Google / 2FA)', basePrice: 0, icon: <FiShield /> },
  { id: 'payments', label: 'Pasarela de Pagos (Stripe / Mercado Pago / PayPal)', basePrice: 1500, icon: <FiCreditCard /> },
  { id: 'whatsapp_bot', label: 'Automatización de Notificaciones / WhatsApp API', basePrice: 2500, icon: <FiSend /> },
  { id: 'seo_pwa', label: 'Optimización SEO Avanzada + PWA', basePrice: 0, icon: <FiZap /> },
  { id: 'multilang', label: 'Soporte Multilenguaje', basePrice: 500, icon: <FiGlobe />, isPerLanguage: true },
]

export default function Costos() {
  const [currency, setCurrency] = useState('MXN') // 'MXN' | 'USD'
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'web' | 'ecommerce' | 'systems' | 'apps'
  const [searchFilter, setSearchFilter] = useState('')

  // Estado del Cotizador
  const [selectedServiceId, setSelectedServiceId] = useState('corp_web')
  const [extraSectionsCount, setExtraSectionsCount] = useState(4)
  const [includeFacturacion, setIncludeFacturacion] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState(['cms', 'auth', 'seo_pwa'])
  const [extraLanguagesCount, setExtraLanguagesCount] = useState(1)

  // Filtrado del tabulador
  const filteredServices = useMemo(() => {
    return officialServices.filter(s => {
      const matchesTab = activeTab === 'all' || s.category === activeTab
      const matchesSearch =
        s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.example.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.scope.toLowerCase().includes(searchFilter.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [activeTab, searchFilter])

  // Servicio seleccionado actualmente
  const selectedServiceObj = useMemo(() => {
    return officialServices.find(s => s.id === selectedServiceId) || officialServices[0]
  }, [selectedServiceId])

  // Cálculo del Cotizador Dinámico
  const { calculatedTotalMXN, addonObjects } = useMemo(() => {
    let total = selectedServiceObj.baseMXN

    // Secciones extras si aplica
    if (selectedServiceObj.id === 'complex_corp') {
      total += extraSectionsCount * 500
    }

    // Timbres de facturación
    if (selectedServiceObj.id === 'ecommerce_adv' && includeFacturacion) {
      total += 1500
    }

    // Addons
    const addonsSum = selectedAddons.reduce((acc, aId) => {
      if (aId === 'multilang') {
        return acc + extraLanguagesCount * 500
      }
      if (aId === 'payments' && selectedServiceObj.includesPaymentGateway) {
        return acc + 0 // Ya incluida gratis en estos 7 proyectos
      }
      const aObj = allAddOns.find(item => item.id === aId)
      return acc + (aObj ? aObj.basePrice : 0)
    }, 0)

    total += addonsSum

    const addonObjs = selectedAddons
      .map(id => {
        const aObj = allAddOns.find(a => a.id === id)
        if (!aObj) return null
        if (id === 'multilang') {
          return {
            ...aObj,
            label: `Soporte Multilenguaje (${extraLanguagesCount} idioma${extraLanguagesCount > 1 ? 's' : ''} extra)`,
            price: extraLanguagesCount * 500,
            isIncludedInBase: false,
          }
        }
        if (id === 'payments') {
          const isIncluded = selectedServiceObj.includesPaymentGateway
          return {
            ...aObj,
            label: isIncluded ? 'Pasarela de Pagos (Stripe / Mercado Pago / PayPal)' : aObj.label,
            price: isIncluded ? 0 : 1500,
            isIncludedInBase: isIncluded,
          }
        }
        return {
          ...aObj,
          price: aObj.basePrice,
          isIncludedInBase: aObj.basePrice === 0,
        }
      })
      .filter(Boolean)

    return {
      calculatedTotalMXN: total,
      addonObjects: addonObjs,
    }
  }, [selectedServiceObj, extraSectionsCount, includeFacturacion, selectedAddons, extraLanguagesCount])

  const toggleAddon = (id) => {
    setSelectedAddons(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const formatPrice = (amountMXN) => {
    if (amountMXN === 0) return 'GRATIS'
    if (currency === 'USD') {
      const val = Math.round(amountMXN / USD_RATE)
      return `$${val.toLocaleString('en-US')} USD`
    }
    return `$${Math.round(amountMXN).toLocaleString('es-MX')} MXN`
  }

  const handleWhatsAppQuote = (customService = null) => {
    const phone = '527223659263'
    const serviceToQuote = customService || selectedServiceObj
    const totalFormatted = customService
      ? currency === 'USD' ? customService.priceDisplayUSD : customService.priceDisplay
      : formatPrice(calculatedTotalMXN)

    const paymentGatewayNotice = serviceToQuote.includesPaymentGateway
      ? '\n💳 *Pasarela de Pagos:* Incluida sin costo adicional'
      : ''

    const addonText = addonObjects.length > 0 && !customService
      ? `\n✨ *Módulos Seleccionados:*\n${addonObjects.map(a => `• ${a.label} (${a.price === 0 ? 'Gratis / Incluido' : formatPrice(a.price)})`).join('\n')}`
      : ''

    const extraSectionText = selectedServiceObj.id === 'complex_corp' && !customService
      ? `\n📄 *Secciones adicionales:* +${extraSectionsCount} secciones`
      : ''

    const text = encodeURIComponent(
      [
        '🚀 *Hola Gadiel, me interesa cotizar un proyecto desde tu Tabulador 2026:*',
        '',
        `📌 *Servicio Seleccionado:* ${serviceToQuote.name}`,
        `💰 *Inversión Estimada:* ${totalFormatted}`,
        paymentGatewayNotice,
        extraSectionText,
        addonText,
        '',
        '¿Podemos agendar una llamada o revisar disponibilidad técnica para este proyecto?',
      ].filter(Boolean).join('\n')
    )
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="costs-page container" style={{ paddingBottom: '6rem' }}>
      
      {/* ── HEADER / HERO COMERCIAL ── */}
      <section className="costs-hero">
        <motion.div className="costs-hero__title-content" {...fadeUp(0.1)}>
          <h1 className="display-title costs-hero__title">
            Servicios digitales &<br />
            <span className="accent-stroke">software a la medida.</span>
          </h1>
        </motion.div>

        <motion.div className="costs-hero__description" {...fadeUp(0.2)}>
          <p className="display-sub" style={{ textAlign: 'left', maxWidth: '720px' }}>
            Estructura comercial formal con costos base, alcances y ejemplos prácticos para todo tipo de desarrollos digitales.
          </p>
        </motion.div>

        </section>

        {/* Selector de Moneda */}
        <motion.div className="costs-currency-bar" {...fadeUp(0.2)}>
          <div className="costs-hero__controls">
          <button
            type="button"
            onClick={() => setCurrency('MXN')}
            style={{
              background: currency === 'MXN' ? 'var(--accent, #00E5FF)' : 'transparent',
              color: currency === 'MXN' ? '#0A0F1D' : 'var(--text)',
              border: 'none',
              padding: '0.45rem 1.2rem',
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🇲🇽 MXN (Pesos)
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            style={{
              background: currency === 'USD' ? 'var(--accent, #00E5FF)' : 'transparent',
              color: currency === 'USD' ? '#0A0F1D' : 'var(--text)',
              border: 'none',
              padding: '0.45rem 1.2rem',
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🇺🇸 USD (Dólares)
          </button>
        </div>
      </motion.div>

      {/* ── TABULADOR OFICIAL 2026 (TABLA / CARDS) ── */}
      <section style={{ marginBottom: '6rem' }}>
        
        {/* Barra de Filtros por Categoría & Buscador */}
        <motion.div
          {...fadeUp(0.1)}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[
              { id: 'all', label: 'Todos (11)' },
              { id: 'web', label: 'Sitios Web' },
              { id: 'ecommerce', label: 'E-Commerce' },
              { id: 'systems', label: 'Sistemas & ERPs' },
              { id: 'apps', label: 'Apps & SaaS' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: activeTab === tab.id ? '1.5px solid var(--accent, #00E5FF)' : '1px solid rgba(255,255,255,0.08)',
                  background: activeTab === tab.id ? 'rgba(0, 229, 255, 0.18)' : 'rgba(255,255,255,0.03)',
                  color: activeTab === tab.id ? '#fff' : 'var(--muted)',
                  transition: 'all 0.25s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Buscar servicio o ejemplo..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem 0.5rem 2.2rem',
                borderRadius: '9999px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
        </motion.div>

        {/* Grid de Servicios del Tabulador */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '1.5rem' }}>
          {filteredServices.map((srv, idx) => (
            <motion.article
              key={srv.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.8rem',
                borderRadius: '18px',
                border: '1px solid var(--border)',
                position: 'relative'
              }}
              {...fadeUp(0.05 + idx * 0.05)}
            >
              <div>
                {/* Header Card */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--accent, #00E5FF)',
                      background: 'rgba(0, 229, 255, 0.12)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '8px'
                    }}
                  >
                    {srv.categoryLabel}
                  </span>

                  {srv.includesPaymentGateway && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#34D399',
                        background: 'rgba(52, 211, 153, 0.12)',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <FiCreditCard size={12} /> Pasarela Incluida
                    </span>
                  )}
                </div>

                {/* Título & Icono */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '1.3rem', color: 'var(--accent, #00E5FF)', marginTop: '2px' }}>{srv.icon}</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', lineHeight: 1.3, margin: 0 }}>
                    {srv.name}
                  </h3>
                </div>

                {/* Precio Oficial */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.05em' }}>
                    Inversión Base
                  </span>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', display: 'block', marginTop: '0.2rem' }}>
                    {currency === 'USD' ? srv.priceDisplayUSD : srv.priceDisplay}
                  </span>
                </div>

                {/* Alcance Operativo & Ejemplo */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: '#fff' }}>Alcance:</strong>
                    <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: '0.2rem 0 0 0', lineHeight: 1.45 }}>
                      {srv.scope}
                    </p>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--accent, #00E5FF)' }}>Ejemplo práctico:</strong>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                      {srv.example}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Card */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => handleWhatsAppQuote(srv)}
                  className="cta-btn"
                  style={{ padding: '0.5rem 1.1rem', fontSize: '0.84rem' }}
                >
                  Cotizar Proyecto <FiArrowRight size={13} />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── CALCULADORA & COTIZADOR INTERACTIVO ── */}
      <section style={{ marginBottom: '6rem' }}>
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: '2.5rem' }}>
          <span className="section-eyebrow">Calculadora en Tiempo Real</span>
          <h2 className="section-heading" style={{ fontSize: '2.2rem', margin: 0 }}>Cotizador de Proyectos a la Medida</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '0.96rem' }}>
            Selecciona el tipo de proyecto del tabulador y activa/desactiva los módulos que requieres para obtener un presupuesto en tiempo real.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* LADO IZQUIERDO: Controles del Cotizador */}
          <motion.div className="glass-card" style={{ padding: '2.2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }} {...fadeUp(0.15)}>
            
            {/* Paso 1: Selección del Servicio */}
            <div>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '0.8rem' }}>
                1. Selecciona el Tipo de Proyecto:
              </label>
              <select
                value={selectedServiceId}
                onChange={e => setSelectedServiceId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(10, 25, 50, 0.95)',
                  border: '1.5px solid var(--border)',
                  color: '#fff',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {officialServices.map(s => (
                  <option key={s.id} value={s.id} style={{ background: '#0a1428', color: '#fff' }}>
                    {s.name} — ({currency === 'USD' ? s.priceDisplayUSD : s.priceDisplay})
                  </option>
                ))}
              </select>
            </div>

            {/* Ajuste condicional: Secciones extra para Corporativo Complejo */}
            {selectedServiceObj.id === 'complex_corp' && (
              <div style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '1.2rem' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                  Secciones Adicionales (+ $500 MXN / $25 USD c/u):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={extraSectionsCount}
                    onChange={e => setExtraSectionsCount(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem', minWidth: '80px', textAlign: 'right' }}>
                    +{extraSectionsCount} págs.
                  </span>
                </div>
              </div>
            )}

            {/* Ajuste condicional: Timbres de Facturación para Ecommerce Avanzado */}
            {selectedServiceObj.id === 'ecommerce_adv' && (
              <label
                htmlFor="chk-facturacion"
                style={{
                  padding: '1rem 1.15rem',
                  borderRadius: '12px',
                  background: includeFacturacion ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255,255,255,0.03)',
                  border: includeFacturacion ? '1.5px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <input
                    type="checkbox"
                    id="chk-facturacion"
                    checked={includeFacturacion}
                    onChange={e => setIncludeFacturacion(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--accent, #00E5FF)', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', display: 'block' }}>Paquete de Timbres Fiscales SAT</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Integración con PAC y facturación CFDI 4.0</span>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                  +{formatPrice(1500)}
                </span>
              </label>
            )}

            {/* Paso 2: Todos los Módulos Opcionales */}
            <div>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '0.8rem' }}>
                2. Módulos & Características Adicionales:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                {allAddOns.map(addon => {
                  const isChecked = selectedAddons.includes(addon.id)
                  
                  // Validación de si la pasarela ya viene incluida gratis en este proyecto
                  const isPaymentModule = addon.id === 'payments'
                  const isPaymentIncludedInCurrentProject = isPaymentModule && selectedServiceObj.includesPaymentGateway

                  const isFree = addon.basePrice === 0 || isPaymentIncludedInCurrentProject

                  return (
                    <div
                      key={addon.id}
                      style={{
                        borderRadius: '14px',
                        background: isChecked ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: isChecked ? '1.5px solid var(--accent, #00E5FF)' : '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '0.95rem 1.15rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <label
                        htmlFor={`addon-${addon.id}`}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.8rem',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <input
                            type="checkbox"
                            id={`addon-${addon.id}`}
                            checked={isChecked}
                            onChange={() => toggleAddon(addon.id)}
                            style={{
                              width: '20px',
                              height: '20px',
                              accentColor: 'var(--accent, #00E5FF)',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          />
                          <span style={{ fontSize: '0.9rem', color: isChecked ? '#fff' : 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                            {addon.label}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            color: isFree ? '#34D399' : (isChecked ? 'var(--accent, #00E5FF)' : 'var(--muted)'),
                            whiteSpace: 'nowrap',
                            background: isFree ? 'rgba(52, 211, 153, 0.12)' : 'transparent',
                            padding: isFree ? '0.25rem 0.65rem' : '0',
                            borderRadius: isFree ? '6px' : '0'
                          }}
                        >
                          {isPaymentIncludedInCurrentProject
                            ? 'GRATIS (INCLUIDA)'
                            : isFree
                            ? 'GRATIS / INCLUIDO'
                            : addon.isPerLanguage
                            ? `+$500 / idioma extra`
                            : `+${formatPrice(addon.basePrice)}`}
                        </span>
                      </label>

                      {/* Contador interactivo de idiomas adicionales cuando multilenguaje está activo */}
                      {addon.id === 'multilang' && isChecked && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid rgba(0, 229, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                          }}
                        >
                          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                            Idiomas adicionales a traducir (Español base + {extraLanguagesCount} extra):
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExtraLanguagesCount(prev => Math.max(1, prev - 1))
                              }}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                border: '1px solid var(--border)',
                                background: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              -
                            </button>
                            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 800, color: 'var(--accent, #00E5FF)', fontSize: '0.95rem' }}>
                              {extraLanguagesCount}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExtraLanguagesCount(prev => Math.min(8, prev + 1))
                              }}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                border: '1px solid var(--border)',
                                background: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              +
                            </button>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', marginLeft: '0.3rem' }}>
                              = +{formatPrice(extraLanguagesCount * 500)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

          </motion.div>

          {/* LADO DERECHO: Resumen Dinámico & Cotización WhatsApp */}
          <motion.div
            className="glass-card"
            style={{
              padding: '2.2rem',
              position: 'sticky',
              top: '6rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.4rem',
              background: 'rgba(10, 28, 55, 0.94)',
              border: '1.5px solid var(--accent, #00E5FF)',
              borderRadius: '22px',
              boxShadow: '0 16px 50px rgba(0, 229, 255, 0.18)'
            }}
            {...fadeUp(0.25)}
          >
            <div>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--accent, #00E5FF)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Resumen de Inversión
              </span>
              <h3 style={{ fontSize: '1.35rem', color: '#fff', marginTop: '0.3rem', lineHeight: 1.25 }}>
                {selectedServiceObj.name}
              </h3>
            </div>

            {/* Desglose */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--muted)' }}>
                <span>Inversión Base:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{formatPrice(selectedServiceObj.baseMXN)}</span>
              </div>
              {selectedServiceObj.id === 'complex_corp' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--muted)' }}>
                  <span>{extraSectionsCount} secciones extra:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>+{formatPrice(extraSectionsCount * 500)}</span>
                </div>
              )}
              {selectedServiceObj.id === 'ecommerce_adv' && includeFacturacion && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--muted)' }}>
                  <span>Timbres Fiscales SAT:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>+{formatPrice(1500)}</span>
                </div>
              )}
              {addonObjects.length > 0 ? (
                addonObjects.map(addon => (
                  <div key={addon.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--muted)' }}>
                    <span>{addon.label}:</span>
                    <span style={{ color: addon.price === 0 ? '#34D399' : '#fff', fontWeight: 600 }}>
                      {addon.price === 0 ? (addon.isIncludedInBase ? 'Gratis (Incluida)' : 'Gratis') : `+${formatPrice(addon.price)}`}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                  Sin módulos adicionales seleccionados
                </div>
              )}
            </div>

            {/* Total */}
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Inversión Total Estimada:
              </span>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
                {formatPrice(calculatedTotalMXN)}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.4rem', margin: '0.4rem 0 0 0' }}>
                *Presupuesto base de referencia. Se formaliza mediante propuesta técnica personalizada.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleWhatsAppQuote()}
              className="cta-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '1rem 1.4rem', fontSize: '0.98rem' }}
            >
              <FiSend style={{ marginRight: '8px' }} /> Enviar Cotización por WhatsApp
            </button>

            <Link
              to="/contacto"
              className="ghost-btn"
              style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}
            >
              Contactar por Correo
            </Link>
          </motion.div>

        </div>
      </section>

      {/* ── CONDICIONES GENERALES Y GARANTÍAS INCLUIDAS (BENTO GRID) ── */}
      <section style={{ marginBottom: '6rem' }}>
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <span className="section-eyebrow">Esquema Institucional</span>
          <h2 className="section-heading" style={{ fontSize: '2.2rem', margin: 0 }}>Condiciones Generales & Garantías Incluidas</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Todos los proyectos operan bajo altos estándares de calidad, seguridad y respaldo operativo.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          {/* Card 1: Flexibilidad Financiera */}
          <motion.div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }} {...fadeUp(0.1)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <span style={{ background: 'rgba(52, 211, 153, 0.12)', padding: '0.6rem', borderRadius: '10px', color: '#34D399' }}>
                <FiDollarSign size={20} />
              </span>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Flexibilidad Financiera</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>
              Contamos con esquemas y planes de pagos fraccionados y adaptables a las etapas y requerimientos de cada cliente.
            </p>
          </motion.div>

          {/* Card 2: Implementación y Despliegue */}
          <motion.div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }} {...fadeUp(0.15)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <span style={{ background: 'rgba(192, 132, 252, 0.12)', padding: '0.6rem', borderRadius: '10px', color: '#C084FC' }}>
                <FiServer size={20} />
              </span>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Implementación y Despliegue</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>
              Incluye la puesta en marcha, configuración de entorno, levantamiento de base de datos y <strong>publicación del sistema o web en producción</strong> en el servidor correspondiente.
            </p>
          </motion.div>

          {/* Card 3: Entregables Finales & Capacitación */}
          <motion.div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }} {...fadeUp(0.2)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <span style={{ background: 'rgba(0, 229, 255, 0.12)', padding: '0.6rem', borderRadius: '10px', color: 'var(--accent)' }}>
                <FiAward size={20} />
              </span>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Entregables Finales</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>
              Entrega de <strong>código fuente 100% propio</strong>, manual de usuario ilustrado, sistema 100% funcional y <strong>capacitación operativa personalizada</strong> (hasta 2 sesiones).
            </p>
          </motion.div>

          {/* Card 4: Garantía de Estabilización (Primer Mes) */}
          <motion.div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }} {...fadeUp(0.25)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <span style={{ background: 'rgba(56, 189, 248, 0.12)', padding: '0.6rem', borderRadius: '10px', color: '#38BDF8' }}>
                <FiShield size={20} />
              </span>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Garantía de Estabilización (1 Mes)</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>
              <strong>30 días posteriores al lanzamiento</strong> para modificaciones tipográficas, cambios de imágenes, soporte con dudas y ajustes cosméticos menores sin costo extra.
            </p>
          </motion.div>

          {/* Card 5: Blindaje y Soporte Operativo (3 Meses) */}
          <motion.div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }} {...fadeUp(0.3)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <span style={{ background: 'rgba(244, 114, 182, 0.12)', padding: '0.6rem', borderRadius: '10px', color: '#F472B6' }}>
                <FiShield size={20} />
              </span>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Blindaje Operativo (3 Meses)</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>
              <strong>Cobertura completa por 90 días</strong> frente a fallas técnicas del código, caídas del sistema bajo condiciones normales de uso y parches de seguridad.
            </p>
          </motion.div>

          {/* Card 6: Metodología Ágil e Hitos */}
          <motion.div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }} {...fadeUp(0.35)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <span style={{ background: 'rgba(0, 229, 255, 0.12)', padding: '0.6rem', borderRadius: '10px', color: 'var(--accent)' }}>
                <FiZap size={20} />
              </span>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Metodología por Hitos</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>
              Planificación estructurada en sprints con revisiones periódicas y validaciones directas de avances funcionales antes del despliegue final.
            </p>
          </motion.div>

        </div>

        {/* Nota sobre Hosting y Dominio */}
        <motion.div
          {...fadeUp(0.4)}
          style={{
            marginTop: '2rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '1.2rem 1.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>ℹ️</span>
          <p style={{ fontSize: '0.86rem', color: 'var(--muted)', margin: 0, lineHeight: 1.45 }}>
            <strong style={{ color: '#fff' }}>Nota sobre infraestructura:</strong> Las tarifas de registro de dominio (.com, .com.mx) y los planes de alojamiento (hosting/cloud) son independientes a los honorarios de desarrollo y se cotizan según las necesidades y escala del cliente.
          </p>
        </motion.div>
      </section>

    </div>
  )
}
