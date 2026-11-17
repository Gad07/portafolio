import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiCreditCard,
  FiGlobe,
  FiZap,
  FiCopy,
  FiCheck,
  FiShield,
  FiDollarSign,
  FiSmartphone,
  FiSend,
  FiArrowRight,
  FiEdit3,
  FiInfo,
  FiLock,
  FiClock
} from 'react-icons/fi'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
})

export default function Pagos() {
  const [searchParams] = useSearchParams()

  // Parámetros opcionales desde URL (?monto=5000&moneda=MXN&concepto=Anticipo&folio=COT-2026-001)
  const paramAmount = searchParams.get('monto')
  const paramCurrency = searchParams.get('moneda')
  const paramConcept = searchParams.get('concepto')
  const paramFolio = searchParams.get('folio')

  const [activeTab, setActiveTab] = useState('stripe') // 'stripe' | 'dolarapp' | 'usdc' | 'spei'
  const [copiedKey, setCopiedKey] = useState(null)
  
  // Costo / Monto editable por el usuario o cliente
  const [currentAmount, setCurrentAmount] = useState(
    paramAmount && Number(paramAmount) > 0 ? Number(paramAmount) : 5000
  )
  const [currentCurrency, setCurrentCurrency] = useState(
    paramCurrency === 'USD' ? 'USD' : 'MXN'
  )
  const [projectConcept, setProjectConcept] = useState(
    paramConcept || 'Anticipo de Desarrollo de Software'
  )
  const [quoteFolio, setQuoteFolio] = useState(paramFolio || '')

  useEffect(() => {
    if (paramAmount && Number(paramAmount) > 0) setCurrentAmount(Number(paramAmount))
    if (paramCurrency) setCurrentCurrency(paramCurrency === 'USD' ? 'USD' : 'MXN')
    if (paramConcept) setProjectConcept(paramConcept)
    if (paramFolio) setQuoteFolio(paramFolio)
  }, [paramAmount, paramCurrency, paramConcept, paramFolio])

  // Configuración de Cuentas y Pasarelas
  const config = {
    stripeUrl: 'https://buy.stripe.com/',
    dolarAppTag: '$gadielpalma',
    achAccount: '1234567890',
    achRouting: '026073150',
    achBank: 'Lead Bank (DolarApp US)',
    usdcAddress: '0x71C...BentoGadielDev (Polygon/Solana)',
    usdcNetwork: 'Polygon / Solana (Tarifa < $0.05 USD)',
    speiClabe: '127180001000000000',
    speiBank: 'Banco Azteca / BBVA',
    beneficiary: 'Gadiel Palma Ramos'
  }

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  const amountNumber = Math.max(0, Number(currentAmount) || 0)
  const isMXN = currentCurrency === 'MXN'
  
  // Equivalencia aproximada
  const USD_RATE = 19.5
  const approxEquivalent = isMXN
    ? Math.round(amountNumber / USD_RATE)
    : Math.round(amountNumber * USD_RATE)

  // ═══════════════════════════════════════════════════════════════════════════
  // CÁLCULO DE LA TARIFA ASUMIDA POR EL CLIENTE (LA TARIFA LA PAGA EL CLIENTE)
  // ═══════════════════════════════════════════════════════════════════════════
  let feeAmount = 0
  let feeLabel = '0% (Sin comisión)'
  let feeExplanation = 'Comisión bancaria cubierta por el cliente: $0'

  if (activeTab === 'stripe') {
    if (isMXN) {
      feeAmount = Math.round(amountNumber * 0.042 + 4)
      feeLabel = '4.2% + $4 MXN (Procesamiento Stripe)'
      feeExplanation = 'La comisión de tarjeta/pasarela la cubre el cliente para asegurar el monto neto acordado.'
    } else {
      feeAmount = Math.round(amountNumber * 0.038 + 1)
      feeLabel = '3.8% + $1 USD (Procesamiento Stripe)'
      feeExplanation = 'La comisión de tarjeta/pasarela la cubre el cliente para asegurar el monto neto acordado.'
    }
  } else if (activeTab === 'dolarapp') {
    feeAmount = 0
    feeLabel = '$0 USD (0% Comisión ACH)'
    feeExplanation = 'Sin comisiones bancarias ni cargos SWIFT en transferencias domésticas ACH en EE.UU.'
  } else if (activeTab === 'usdc') {
    feeAmount = 0
    feeLabel = '< $0.05 USD (Gas pagado por tu wallet)'
    feeExplanation = 'La microtarifa de gas de la red Solana o Polygon la paga tu billetera al enviar.'
  } else if (activeTab === 'spei') {
    feeAmount = 0
    feeLabel = '$0 MXN (0% Comisión SPEI)'
    feeExplanation = 'Transferencia directa interbancaria nacional sin cargos para ninguna de las partes.'
  }

  const totalToPay = amountNumber + feeAmount

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    activeTab === 'stripe' ? config.stripeUrl :
    activeTab === 'dolarapp' ? `https://dolarapp.com/pay/${config.dolarAppTag}` :
    activeTab === 'usdc' ? config.usdcAddress :
    config.speiClabe
  )}`

  const getMethodName = () => {
    switch (activeTab) {
      case 'stripe': return 'Stripe (Tarjeta / Apple Pay)'
      case 'dolarapp': return 'DolarApp (ACH EE.UU.)'
      case 'usdc': return 'USDC / USDT Cripto'
      case 'spei': return 'SPEI Interbancario (México)'
      default: return 'Pasarela'
    }
  }

  return (
    <div className="container" style={{ paddingTop: '6.5rem', paddingBottom: '6rem' }}>
      
      {/* ── ENCABEZADO PRINCIPAL DE LA PÁGINA ── */}
      <motion.div {...fadeUp(0.05)} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 229, 255, 0.12)', border: '1px solid rgba(0, 229, 255, 0.35)', padding: '5px 14px', borderRadius: '30px', fontSize: '0.8rem', color: '#00E5FF', fontWeight: 700, marginBottom: '0.8rem' }}>
          <FiZap size={14} /> Liquidación Inmediata • Mismo Día
        </div>
        <h1 className="section-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '0 0 0.8rem 0' }}>
          Pasarela de Pago Internacional & Anticipos
        </h1>
        <p style={{ maxWidth: '650px', margin: '0 auto', color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6 }}>
          Módulo oficial de cobro directo y anticipos. Puedes <strong>editar el costo acordado</strong> libremente. Las tarifas de procesamiento bancarias son cubiertas de forma transparente por el cliente.
        </p>
      </motion.div>

      {/* ── GRID PRINCIPAL: 2 COLUMNAS (CONFIGURACIÓN EDITABLE + PASARELA) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* COLUMNA 1: CONFIGURACIÓN EDITABLE DEL MONTO Y DETALLES */}
        <motion.div className="glass-card" style={{ padding: '2.2rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }} {...fadeUp(0.15)}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiEdit3 color="#00E5FF" size={20} />
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 800 }}>
              1. Monto Editable & Concepto
            </h2>
          </div>

          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)', lineHeight: 1.5 }}>
            Ingresa o ajusta el importe convenido para tu proyecto o hito de software. Puedes alternar entre Pesos Mexicanos (MXN) y Dólares Americanos (USD).
          </p>

          {/* Campo Monto & Moneda */}
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
              Importe Neto Acordado:
            </label>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#00E5FF', fontWeight: 900, fontSize: '1.4rem' }}>
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={currentAmount || ''}
                  onChange={e => setCurrentAmount(Number(e.target.value))}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    color: '#fff',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1.5px solid rgba(0, 229, 255, 0.4)',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <select
                value={currentCurrency}
                onChange={e => setCurrentCurrency(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#fff',
                  background: '#070E22',
                  border: '1.5px solid rgba(0, 229, 255, 0.4)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="MXN">🇲🇽 MXN</option>
                <option value="USD">🇺🇸 USD</option>
              </select>
            </div>
          </div>

          {/* Presets Rápidos */}
          <div>
            <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>
              Montos Rápidos / Frecuentes:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {[1500, 3000, 5000, 7000, 10000, 15000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCurrentAmount(val)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    background: currentAmount === val ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: currentAmount === val ? '1.5px solid #00E5FF' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: currentAmount === val ? '#00E5FF' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ${val.toLocaleString()}
                </button>
              ))}
            </div>
            <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
              Equivalente aproximado: <strong>${approxEquivalent.toLocaleString()} {isMXN ? 'USD' : 'MXN'}</strong>
            </span>
          </div>

          {/* Concepto y Folio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>
                Concepto del Pago:
              </label>
              <input
                type="text"
                value={projectConcept}
                onChange={e => setProjectConcept(e.target.value)}
                placeholder="Ej. Anticipo Desarrollo Web Institucional"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  color: '#fff',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>
                Folio de Cotización / Contrato (Opcional):
              </label>
              <input
                type="text"
                value={quoteFolio}
                onChange={e => setQuoteFolio(e.target.value)}
                placeholder="Ej. COT-2026-001"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--accent, #00E5FF)',
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          {/* Cuadro Informativo de Seguridad */}
          <div style={{ background: 'rgba(0, 229, 255, 0.04)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <FiShield size={24} color="#00E5FF" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.45 }}>
              Transacciones encriptadas punto a punto con trazabilidad inmediata y entrega formal de comprobante digital.
            </span>
          </div>

        </motion.div>

        {/* COLUMNA 2: SELECCIÓN DE CANAL & DESGLOSE (LA TARIFA LA PAGA EL CLIENTE) */}
        <motion.div className="glass-card" style={{ padding: '2.2rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }} {...fadeUp(0.25)}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCreditCard color="#00E5FF" size={20} />
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 800 }}>
              2. Método de Liquidación
            </h2>
          </div>

          {/* Selector de Pestañas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
            
            <button
              type="button"
              onClick={() => setActiveTab('stripe')}
              style={{
                padding: '0.8rem 0.5rem',
                borderRadius: '12px',
                border: activeTab === 'stripe' ? '2px solid #00E5FF' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === 'stripe' ? 'rgba(0, 229, 255, 0.16)' : 'rgba(255,255,255,0.02)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <FiCreditCard size={19} color={activeTab === 'stripe' ? '#00E5FF' : '#94A3B8'} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Stripe / Tarjetas</span>
              <span style={{ fontSize: '0.68rem', color: '#38BDF8' }}>Apple / Google Pay</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dolarapp')}
              style={{
                padding: '0.8rem 0.5rem',
                borderRadius: '12px',
                border: activeTab === 'dolarapp' ? '2px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === 'dolarapp' ? 'rgba(16, 185, 129, 0.16)' : 'rgba(255,255,255,0.02)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <FiGlobe size={19} color={activeTab === 'dolarapp' ? '#10B981' : '#94A3B8'} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>DolarApp / USA</span>
              <span style={{ fontSize: '0.68rem', color: '#10B981' }}>ACH $0 Comisión</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('usdc')}
              style={{
                padding: '0.8rem 0.5rem',
                borderRadius: '12px',
                border: activeTab === 'usdc' ? '2px solid #A855F7' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === 'usdc' ? 'rgba(168, 85, 247, 0.16)' : 'rgba(255,255,255,0.02)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <FiZap size={19} color={activeTab === 'usdc' ? '#C084FC' : '#94A3B8'} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Cripto USDC</span>
              <span style={{ fontSize: '0.68rem', color: '#C084FC' }}>En 5 segundos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('spei')}
              style={{
                padding: '0.8rem 0.5rem',
                borderRadius: '12px',
                border: activeTab === 'spei' ? '2px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === 'spei' ? 'rgba(56, 189, 248, 0.16)' : 'rgba(255,255,255,0.02)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <FiSmartphone size={19} color={activeTab === 'spei' ? '#38BDF8' : '#94A3B8'} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>SPEI México</span>
              <span style={{ fontSize: '0.68rem', color: '#38BDF8' }}>Acreditación 1 min</span>
            </button>

          </div>

          {/* DESGLOSE DE TARIFA ASUMIDA POR EL CLIENTE */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1.5px solid rgba(255, 255, 255, 0.09)',
              borderRadius: '14px',
              padding: '1.1rem 1.3rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#94a3b8' }}>
              <span>Monto Neto Acordado (Desarrollo):</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>${amountNumber.toLocaleString()} {currentCurrency}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: feeAmount > 0 ? '#FBBF24' : '#34D399' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FiShield size={14} /> Tarifa de Procesamiento (Cubierta por el Cliente):
              </span>
              <span style={{ fontWeight: 800 }}>
                {feeAmount > 0 ? `+$${feeAmount.toLocaleString()} ${currentCurrency}` : '$0.00 (0%)'}
              </span>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.4 }}>
              * {feeExplanation}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                paddingTop: '0.75rem',
                marginTop: '0.4rem'
              }}
            >
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff' }}>
                Total a Liquidar por el Cliente:
              </span>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#00E5FF', letterSpacing: '-0.01em' }}>
                ${totalToPay.toLocaleString()} {currentCurrency}
              </div>
            </div>
          </div>

          {/* DETALLES ESPECÍFICOS DEL MÉTODO SELECCIONADO */}
          
          {/* STRIPE */}
          {activeTab === 'stripe' && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#fff', display: 'block' }}>Pago con Tarjeta Global vía Stripe</strong>
                <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Acepta tarjetas de 135+ países, Apple Pay y Google Pay con liquidación inmediata.</span>
              </div>

              <a
                href={config.stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--accent"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '0.95rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #00E5FF, #6366f1)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(0, 229, 255, 0.35)'
                }}
              >
                <FiCreditCard size={18} /> Pagar ${totalToPay.toLocaleString()} {currentCurrency} con Stripe <FiArrowRight />
              </a>
            </div>
          )}

          {/* DOLARAPP / ACH USA */}
          {activeTab === 'dolarapp' && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#fff', display: 'block' }}>Transferencia Doméstica ACH en EE.UU. (DolarApp)</strong>
                <span style={{ fontSize: '0.82rem', color: '#34D399' }}>$0 comisiones. Ideal para clientes estadounidenses o remesas directas.</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', background: 'rgba(0,0,0,0.35)', padding: '1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', display: 'block' }}>Tag DolarApp (Inmediato):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <strong style={{ color: '#10B981', fontSize: '1rem' }}>{config.dolarAppTag}</strong>
                    <button onClick={() => copyToClipboard(config.dolarAppTag, 'tag')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                      {copiedKey === 'tag' ? <FiCheck color="#34D399" /> : <FiCopy size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', display: 'block' }}>Routing (ABA / ACH):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{config.achRouting}</strong>
                    <button onClick={() => copyToClipboard(config.achRouting, 'routing')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                      {copiedKey === 'routing' ? <FiCheck color="#34D399" /> : <FiCopy size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', display: 'block' }}>Número de Cuenta:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{config.achAccount}</strong>
                    <button onClick={() => copyToClipboard(config.achAccount, 'account')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                      {copiedKey === 'account' ? <FiCheck color="#34D399" /> : <FiCopy size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', display: 'block' }}>Banco Receptor:</span>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginTop: '3px' }}>{config.achBank}</strong>
                </div>
              </div>
            </div>
          )}

          {/* CRIPTO USDC */}
          {activeTab === 'usdc' && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#fff', display: 'block' }}>Dólares Digitales USDC / USDT</strong>
                <span style={{ fontSize: '0.82rem', color: '#C084FC' }}>Comisión menor a $0.05 USD y confirmación en 5 segundos (24/7).</span>
              </div>

              <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <img
                  src={qrUrl}
                  alt="QR Cripto"
                  style={{ width: '135px', height: '135px', borderRadius: '12px', background: '#fff', padding: '6px' }}
                />

                <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Redes Aceptadas:</span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#C084FC' }}>{config.usdcNetwork}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Dirección de Wallet:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.4)', padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginTop: '3px' }}>
                      <code style={{ fontSize: '0.76rem', color: '#fff', wordBreak: 'break-all', flex: 1 }}>
                        {config.usdcAddress}
                      </code>
                      <button onClick={() => copyToClipboard(config.usdcAddress, 'usdc')} className="btn btn--ghost" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                        {copiedKey === 'usdc' ? <FiCheck color="#4ADE80" /> : <FiCopy />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SPEI MÉXICO */}
          {activeTab === 'spei' && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#fff', display: 'block' }}>Transferencia Interbancaria SPEI (México)</strong>
                <span style={{ fontSize: '0.82rem', color: '#38BDF8' }}>Sin comisiones bancarias. Acreditación en 1 a 2 minutos.</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', background: 'rgba(0,0,0,0.35)', padding: '1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', display: 'block' }}>CLABE Interbancaria:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <strong style={{ color: '#38BDF8', fontSize: '1rem', letterSpacing: '0.04em' }}>{config.speiClabe}</strong>
                    <button onClick={() => copyToClipboard(config.speiClabe, 'clabe')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                      {copiedKey === 'clabe' ? <FiCheck color="#34D399" /> : <FiCopy size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', display: 'block' }}>Banco:</span>
                  <strong style={{ color: '#fff', fontSize: '0.95rem', display: 'block', marginTop: '3px' }}>{config.speiBank}</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', display: 'block' }}>Beneficiario:</span>
                  <strong style={{ color: '#fff', fontSize: '0.95rem', display: 'block', marginTop: '3px' }}>{config.beneficiary}</strong>
                </div>
              </div>
            </div>
          )}

          {/* BOTÓN WHATSAPP PARA NOTIFICAR COMPROBANTE */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              ¿Ya realizaste tu transferencia o pago?
            </span>
            <a
              href={`https://wa.me/527223659263?text=${encodeURIComponent(`Hola Gadiel, acabo de realizar el pago de mi proyecto (${projectConcept}${quoteFolio ? ` - Folio: ${quoteFolio}` : ''}) por un total de $${totalToPay.toLocaleString()} ${currentCurrency} vía ${getMethodName()}. Te adjunto mi comprobante para comenzar/avanzar con el desarrollo.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--accent"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.4rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                background: '#10B981',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '10px'
              }}
            >
              <FiSend /> Notificar por WhatsApp (${totalToPay.toLocaleString()} {currentCurrency})
            </a>
          </div>

        </motion.div>

      </div>

    </div>
  )
}

