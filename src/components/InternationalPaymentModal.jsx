import React, { useState, useEffect } from 'react';
import {
  FiCreditCard,
  FiGlobe,
  FiZap,
  FiCopy,
  FiCheck,
  FiX,
  FiShield,
  FiDollarSign,
  FiSmartphone,
  FiSend,
  FiArrowRight,
  FiEdit3,
  FiInfo
} from 'react-icons/fi';

export default function InternationalPaymentModal({
  isOpen,
  onClose,
  amount = 0,
  currency = 'MXN',
  concept = 'Anticipo de Desarrollo de Software',
  quoteFolio = '',
  paymentConfig = {}
}) {
  const [activeTab, setActiveTab] = useState('stripe'); // 'stripe' | 'dolarapp' | 'usdc' | 'spei'
  const [copiedKey, setCopiedKey] = useState(null);
  
  // Costo / Monto editable por el usuario o cliente
  const [currentAmount, setCurrentAmount] = useState(Number(amount) || 0);
  const [currentCurrency, setCurrentCurrency] = useState(currency || 'MXN');

  // Sincronizar cuando se abra o cambien los props iniciales
  useEffect(() => {
    if (isOpen) {
      if (amount && Number(amount) > 0) {
        setCurrentAmount(Number(amount));
      } else if (!currentAmount || currentAmount === 0) {
        setCurrentAmount(3000); // Valor de referencia por defecto si viene vacío
      }
      if (currency) {
        setCurrentCurrency(currency);
      }
    }
  }, [isOpen, amount, currency]);

  if (!isOpen) return null;

  // Valores predeterminados o configurables
  const config = {
    stripeUrl: paymentConfig.stripeUrl || 'https://buy.stripe.com/',
    dolarAppTag: paymentConfig.dolarAppTag || '$gadielpalma',
    achAccount: paymentConfig.achAccount || '1234567890',
    achRouting: paymentConfig.achRouting || '026073150',
    achBank: paymentConfig.achBank || 'Lead Bank (DolarApp US)',
    usdcAddress: paymentConfig.usdcAddress || '0x71C...BentoGadielDev (Polygon/Solana)',
    usdcNetwork: paymentConfig.usdcNetwork || 'Polygon / Solana (Tarifa < $0.05 USD)',
    speiClabe: paymentConfig.speiClabe || '127180001000000000',
    speiBank: paymentConfig.speiBank || 'Banco Azteca / BBVA',
    beneficiary: paymentConfig.beneficiary || 'Gadiel Palma Ramos',
    ...paymentConfig
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const amountNumber = Math.max(0, Number(currentAmount) || 0);
  const isMXN = currentCurrency === 'MXN';
  
  // Equivalencia aproximada entre MXN y USD
  const USD_RATE = 19.5;
  const approxEquivalent = isMXN
    ? Math.round(amountNumber / USD_RATE)
    : Math.round(amountNumber * USD_RATE);

  // ═══════════════════════════════════════════════════════════════════════════
  // CÁLCULO DE LA TARIFA ASUMIDA POR EL CLIENTE (LA TARIFA LA PAGA EL CLIENTE)
  // ═══════════════════════════════════════════════════════════════════════════
  // Para Stripe: 3.6% + $3.00 MXN (+ IVA 16% sobre comisión = ~4.18% + $3.48 MXN)
  // En USD: ~3.6% + $0.30 USD
  let feeAmount = 0;
  let feeLabel = '0% (Sin comisión)';
  let feeExplanation = 'Comisión cubierta por el cliente: $0';

  if (activeTab === 'stripe') {
    if (isMXN) {
      // Cálculo exacto para que el neto sea el monto acordado
      feeAmount = Math.round(amountNumber * 0.042 + 4);
      feeLabel = '4.2% + $4 MXN (Procesamiento Stripe)';
      feeExplanation = 'La comisión de tarjeta/pasarela la cubre el cliente para garantizar el monto neto del desarrollo.';
    } else {
      feeAmount = Math.round(amountNumber * 0.038 + 1);
      feeLabel = '3.8% + $1 USD (Procesamiento Stripe)';
      feeExplanation = 'La comisión de tarjeta/pasarela la cubre el cliente para garantizar el monto neto del desarrollo.';
    }
  } else if (activeTab === 'dolarapp') {
    feeAmount = 0;
    feeLabel = '$0 USD (0% Comisión ACH)';
    feeExplanation = 'Sin comisiones bancarias ni tarifas ocultas en transferencias domésticas ACH en EE.UU.';
  } else if (activeTab === 'usdc') {
    feeAmount = 0;
    feeLabel = '< $0.05 USD (Gas de Red pagado por tu wallet)';
    feeExplanation = 'La microtarifa de gas de la red Solana o Polygon la paga directamente tu billetera al enviar.';
  } else if (activeTab === 'spei') {
    feeAmount = 0;
    feeLabel = '$0 MXN (0% Comisión SPEI)';
    feeExplanation = 'Transferencia directa interbancaria nacional sin cargos para ninguna de las partes.';
  }

  const totalToPay = amountNumber + feeAmount;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    activeTab === 'stripe' ? config.stripeUrl :
    activeTab === 'dolarapp' ? `https://dolarapp.com/pay/${config.dolarAppTag}` :
    activeTab === 'usdc' ? config.usdcAddress :
    config.speiClabe
  )}`;

  const getMethodName = () => {
    switch (activeTab) {
      case 'stripe': return 'Stripe (Tarjeta / Apple Pay)';
      case 'dolarapp': return 'DolarApp (ACH USA)';
      case 'usdc': return 'USDC / USDT Cripto';
      case 'spei': return 'SPEI México';
      default: return 'Pasarela';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(5, 10, 25, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '700px',
          maxHeight: '94vh',
          overflowY: 'auto',
          background: '#0a1024',
          border: '1.5px solid rgba(0, 229, 255, 0.4)',
          borderRadius: '22px',
          padding: '2rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 25px rgba(0, 229, 255, 0.2)',
          position: 'relative',
          color: '#fff'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          aria-label="Cerrar modal"
        >
          <FiX size={18} />
        </button>

        {/* Encabezado del Modal */}
        <div style={{ marginBottom: '1.4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', color: '#34D399', fontWeight: 700, marginBottom: '0.5rem' }}>
            <FiZap size={13} /> Liquidación Inmediata • Mismo Día
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: '#fff', letterSpacing: '-0.01em' }}>
            Pasarela de Pago Internacional & Anticipos
          </h2>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)', lineHeight: 1.45 }}>
            Puedes editar el costo o monto a transferir. Las tarifas de procesamiento son cubiertas por el cliente de forma transparente.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            SECCIÓN EDITABLE: MONTO A PAGAR & MONEDA
           ══════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1.5px solid rgba(0, 229, 255, 0.35)',
            borderRadius: '16px',
            padding: '1.2rem 1.4rem',
            marginBottom: '1.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiEdit3 color="#00E5FF" size={15} />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#00E5FF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Monto Editable del Proyecto / Anticipo
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
              {concept} {quoteFolio ? `• Folio: ${quoteFolio}` : ''}
            </span>
          </div>

          {/* Campo de Entrada de Monto y Selector de Moneda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#00E5FF', fontWeight: 800, fontSize: '1.3rem' }}>
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
                  padding: '0.65rem 1rem 0.65rem 2.2rem',
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  color: '#fff',
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Selector de Moneda MXN / USD */}
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
                borderRadius: '10px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="MXN">🇲🇽 MXN (Pesos)</option>
              <option value="USD">🇺🇸 USD (Dólares)</option>
            </select>
          </div>

          {/* Botones de Montos Rápidos / Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', marginRight: '2px' }}>Presets:</span>
            {[1500, 3000, 5000, 7000, 10000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setCurrentAmount(val)}
                style={{
                  padding: '0.25rem 0.55rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: currentAmount === val ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  border: currentAmount === val ? '1px solid #00E5FF' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: currentAmount === val ? '#00E5FF' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                ${val.toLocaleString()}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: '0.76rem', color: '#94a3b8' }}>
              Aprox: <strong>${approxEquivalent.toLocaleString()} {isMXN ? 'USD' : 'MXN'}</strong>
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            SELECTOR DE PESTAÑAS DE MÉTODOS
           ══════════════════════════════════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.5rem', marginBottom: '1.2rem' }}>
          
          <button
            type="button"
            onClick={() => setActiveTab('stripe')}
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '12px',
              border: activeTab === 'stripe' ? '2px solid #00E5FF' : '1px solid rgba(255,255,255,0.08)',
              background: activeTab === 'stripe' ? 'rgba(0, 229, 255, 0.14)' : 'rgba(255,255,255,0.02)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <FiCreditCard size={18} color={activeTab === 'stripe' ? '#00E5FF' : '#94A3B8'} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Stripe / Tarjetas</span>
            <span style={{ fontSize: '0.67rem', color: '#38BDF8' }}>Apple / Google Pay</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dolarapp')}
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '12px',
              border: activeTab === 'dolarapp' ? '2px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
              background: activeTab === 'dolarapp' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255,255,255,0.02)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <FiGlobe size={18} color={activeTab === 'dolarapp' ? '#10B981' : '#94A3B8'} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>DolarApp / USA</span>
            <span style={{ fontSize: '0.67rem', color: '#10B981' }}>ACH $0 Comisión</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('usdc')}
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '12px',
              border: activeTab === 'usdc' ? '2px solid #A855F7' : '1px solid rgba(255,255,255,0.08)',
              background: activeTab === 'usdc' ? 'rgba(168, 85, 247, 0.14)' : 'rgba(255,255,255,0.02)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <FiZap size={18} color={activeTab === 'usdc' ? '#C084FC' : '#94A3B8'} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Cripto USDC</span>
            <span style={{ fontSize: '0.67rem', color: '#C084FC' }}>En 5 segundos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spei')}
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '12px',
              border: activeTab === 'spei' ? '2px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)',
              background: activeTab === 'spei' ? 'rgba(56, 189, 248, 0.14)' : 'rgba(255,255,255,0.02)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <FiSmartphone size={18} color={activeTab === 'spei' ? '#38BDF8' : '#94A3B8'} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>SPEI México</span>
            <span style={{ fontSize: '0.67rem', color: '#38BDF8' }}>Acreditación 1 min</span>
          </button>

        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            DESGLOSE FINANCIERO: LA TARIFA LA PAGA EL CLIENTE
           ══════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '0.9rem 1.1rem',
            marginBottom: '1.3rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
            <span>Monto Neto Acordado (Desarrollo):</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>${amountNumber.toLocaleString()} {currentCurrency}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: feeAmount > 0 ? '#FBBF24' : '#34D399' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FiShield size={13} /> Tarifa de Procesamiento (Cubierta por el Cliente):
            </span>
            <span style={{ fontWeight: 700 }}>
              {feeAmount > 0 ? `+$${feeAmount.toLocaleString()} ${currentCurrency}` : '$0.00 (0%)'}
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.35 }}>
            * {feeExplanation}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '0.6rem',
              marginTop: '0.3rem'
            }}
          >
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>
              Total a Liquidar por el Cliente:
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00E5FF' }}>
              ${totalToPay.toLocaleString()} {currentCurrency}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            DETALLE DEL MÉTODO SELECCIONADO
           ══════════════════════════════════════════════════════════════════════ */}
        
        {/* 1. STRIPE (TARJETAS INTERNACIONALES) */}
        {activeTab === 'stripe' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.3rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.98rem', color: '#fff', display: 'block' }}>Pago con Tarjeta de Crédito / Débito Internacional</strong>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Acepta Visa, Mastercard, American Express, Apple Pay y Google Pay.</span>
              </div>
              <span style={{ background: '#00E5FF22', color: '#00E5FF', border: '1px solid #00E5FF44', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                135+ Países
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.45 }}>
              Procesamiento de grado bancario SSL encriptado con liquidación rápida y protección anti-fraude certificada por Stripe. El cargo incluye la comisión bancaria cubierta por el cliente.
            </p>

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
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                borderRadius: '10px',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #00E5FF, #6366f1)',
                color: '#fff',
                boxShadow: '0 4px 18px rgba(0, 229, 255, 0.3)'
              }}
            >
              <FiCreditCard /> Abrir Checkout Seguro (${totalToPay.toLocaleString()} {currentCurrency}) <FiArrowRight />
            </a>
          </div>
        )}

        {/* 2. DOLARAPP / ACH USA (ULTRABAJO COSTO Y MISMO DÍA) */}
        {activeTab === 'dolarapp' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.3rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.98rem', color: '#fff', display: 'block' }}>Transferencia Internacional ACH / Wire en EE.UU.</strong>
                <span style={{ fontSize: '0.78rem', color: '#34D399' }}>Tarifa $0 USD para el cliente y liquidación el mismo día vía SPEI.</span>
              </div>
              <span style={{ background: '#10B98122', color: '#34D399', border: '1px solid #10B98144', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                $0 Comisión
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', background: 'rgba(0,0,0,0.35)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block' }}>Tag DolarApp (Pago Instantáneo):</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <strong style={{ color: '#10B981', fontSize: '0.95rem' }}>{config.dolarAppTag}</strong>
                  <button onClick={() => copyToClipboard(config.dolarAppTag, 'tag')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                    {copiedKey === 'tag' ? <FiCheck color="#34D399" /> : <FiCopy size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block' }}>Routing Number (ABA / ACH):</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{config.achRouting}</strong>
                  <button onClick={() => copyToClipboard(config.achRouting, 'routing')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                    {copiedKey === 'routing' ? <FiCheck color="#34D399" /> : <FiCopy size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block' }}>Account Number (Cuenta EE.UU.):</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{config.achAccount}</strong>
                  <button onClick={() => copyToClipboard(config.achAccount, 'account')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                    {copiedKey === 'account' ? <FiCheck color="#34D399" /> : <FiCopy size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block' }}>Banco Beneficiario:</span>
                <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{config.achBank}</strong>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted)' }}>
              * Ideal para clientes con cuenta en EE.UU. o usuarios de DolarApp. Permite transferir sin cargos SWIFT.
            </p>
          </div>
        )}

        {/* 3. CRIPTO ESTABLE (USDC / USDT) */}
        {activeTab === 'usdc' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.3rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.98rem', color: '#fff', display: 'block' }}>Dólares Digitales USDC / USDT</strong>
                <span style={{ fontSize: '0.78rem', color: '#C084FC' }}>Comisión menor a $0.05 USD y acreditación en 5 segundos (24/7).</span>
              </div>
              <span style={{ background: '#A855F722', color: '#C084FC', border: '1px solid #A855F744', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                Redes L2 Ultrarrápidas
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <img
                src={qrUrl}
                alt="QR Pago Cripto"
                style={{ width: '125px', height: '125px', borderRadius: '10px', background: '#fff', padding: '6px' }}
              />

              <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Redes Aceptadas:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#C084FC' }}>{config.usdcNetwork}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Dirección de Billetera (USDC / USDT):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.4)', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginTop: '2px' }}>
                    <code style={{ fontSize: '0.75rem', color: '#fff', wordBreak: 'break-all', flex: 1 }}>
                      {config.usdcAddress}
                    </code>
                    <button onClick={() => copyToClipboard(config.usdcAddress, 'usdc')} className="btn btn--ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                      {copiedKey === 'usdc' ? <FiCheck color="#4ADE80" /> : <FiCopy />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. SPEI DIRECTO (MÉXICO) */}
        {activeTab === 'spei' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.3rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.98rem', color: '#fff', display: 'block' }}>Transferencia Interbancaria SPEI (México)</strong>
                <span style={{ fontSize: '0.78rem', color: '#38BDF8' }}>Sin comisiones bancarias. Acreditación en 1 a 2 minutos.</span>
              </div>
              <span style={{ background: '#0284c722', color: '#38BDF8', border: '1px solid #0284c744', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                SPEI Nacional
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', background: 'rgba(0,0,0,0.35)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block' }}>CLABE Interbancaria (18 dígitos):</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <strong style={{ color: '#38BDF8', fontSize: '0.95rem', letterSpacing: '0.04em' }}>{config.speiClabe}</strong>
                  <button onClick={() => copyToClipboard(config.speiClabe, 'clabe')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                    {copiedKey === 'clabe' ? <FiCheck color="#34D399" /> : <FiCopy size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block' }}>Banco:</span>
                <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{config.speiBank}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block' }}>Beneficiario:</span>
                <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{config.beneficiary}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Notificación de Comprobante por WhatsApp */}
        <div style={{ marginTop: '1.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--muted)' }}>
            <FiShield color="#10B981" />
            <span>Al completar tu pago, el comprobante se valida de inmediato el mismo día.</span>
          </div>

          <a
            href={`https://wa.me/527223659263?text=${encodeURIComponent(`Hola Gadiel, acabo de realizar el pago del anticipo de mi proyecto (${concept}${quoteFolio ? ` - Folio: ${quoteFolio}` : ''}) por un total de $${totalToPay.toLocaleString()} ${currentCurrency} vía ${getMethodName()}. Te adjunto mi comprobante.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              color: '#34D399',
              borderColor: 'rgba(16, 185, 129, 0.4)'
            }}
          >
            <FiSend /> Notificar por WhatsApp (${totalToPay.toLocaleString()} {currentCurrency})
          </a>
        </div>

      </div>
    </div>
  );
}
