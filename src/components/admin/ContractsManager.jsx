import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  FiFileText,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPrinter,
  FiDownload,
  FiCopy,
  FiCheck,
  FiSearch,
  FiShield,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiArrowLeft
} from 'react-icons/fi';

export default function ContractsManager({ incomingQuote, onClearIncomingQuote }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modos de visualización: 'list' | 'editor' | 'preview'
  const [viewMode, setViewMode] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const printDocumentRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    contractNumber: '',
    quoteFolio: '',
    clientName: '',
    clientCompany: '',
    clientTaxId: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    providerName: 'Gadiel Palma Ramos',
    providerTaxId: 'PARG990101XXX',
    providerAddress: 'Toluca, Estado de México',
    providerEmail: 'gadpalma7@gmail.com',
    providerPhone: '+52 722 365 9263',
    projectName: 'Desarrollo de Plataforma Web / Sistema de Software',
    projectScope: '',
    totalAmount: 14000,
    currency: 'MXN',
    paymentScheme: '50% anticipo al firmar y 50% contra entrega final y satisfacción.',
    downPaymentAmount: 7000,
    startDate: new Date().toISOString().split('T')[0],
    deliveryWeeks: 4,
    warrantyDays: 30,
    status: 'Pendiente de Firma',
    customClauses: ''
  });

  // Al recibir cotización entrante para convertir a contrato
  useEffect(() => {
    if (incomingQuote) {
      const contractNum = `CTR-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}`;
      const itemsScope = (incomingQuote.items || [])
        .map((it, idx) => `${idx + 1}. ${it.name} (Cantidad: ${it.quantity}): ${it.description || ''}`)
        .join('\n\n');
      const scopeDesc = [
        itemsScope,
        incomingQuote.projectScope ? `\n\nALCANCES TÉCNICOS & COBERTURA:\n${incomingQuote.projectScope}` : ''
      ].filter(Boolean).join('');

      const isRecurring = incomingQuote.proposalType === 'recurring';
      let paymentScheme = '';
      if (isRecurring) {
        paymentScheme = `Póliza de servicio recurrente: Cuota ${incomingQuote.billingCycleLabel || 'mensual'} de $${Number(incomingQuote.total || 0).toLocaleString()} ${incomingQuote.currency}. Regla de cobro: ${incomingQuote.recurringBillingRule || 'Pago anticipado los primeros 5 días naturales de cada ciclo'}. Plazo contractual: ${incomingQuote.recurringTermMonths === 0 ? 'Sin plazo forzoso (renovación periódica automática)' : `${incomingQuote.recurringTermMonths} meses de compromiso`}. Bolsa de horas incluida: ${incomingQuote.recurringHoursIncluded || 10} horas por ciclo (tarifa por hora excedente: $${incomingQuote.recurringHourlyOverage || 350} ${incomingQuote.currency}/hr).`;
      } else if (incomingQuote.applyPaymentSchedule && incomingQuote.paymentMilestones?.length > 0) {
        paymentScheme = `Calendario de pagos en ${incomingQuote.paymentMilestones.length} hitos:\n` +
          incomingQuote.paymentMilestones.map(m => `• ${m.title} (${m.percent}% - $${Number(m.amount).toLocaleString()} ${incomingQuote.currency}): ${m.condition || 'Contra entrega'}`).join('\n');
      } else {
        paymentScheme = `${incomingQuote.downPaymentPercent || 50}% de anticipo al firmar y ${100 - (incomingQuote.downPaymentPercent || 50)}% contra entrega final y satisfacción en servidor de pruebas.`;
      }

      let customClauses = incomingQuote.notes || '';
      if (isRecurring) {
        customClauses = (customClauses ? customClauses + '\n\n' : '') +
          `NIVEL DE SERVICIO (SLA) & ATENCIÓN TÉCNICA: ${incomingQuote.recurringSlaResponse || 'Atención a incidencias críticas en menos de 4 horas hábiles; requerimientos regulares en menos de 24 horas hábiles'}. La bolsa mensual de horas no es acumulable entre períodos sucesivos.`;
      }
      if (incomingQuote.discountPercent > 0 && incomingQuote.discountCondition) {
        customClauses = (customClauses ? customClauses + '\n\n' : '') +
          `CONDICIÓN DEL DESCUENTO (${incomingQuote.discountPercent}%): Sujeto a que "${incomingQuote.discountCondition}". En caso de cancelación parcial o incumplimiento de dicha condición, se aplicará el costo unitario de tabulador estándar.`;
      }

      setEditingId(null);
      setFormData({
        contractNumber: contractNum,
        quoteFolio: incomingQuote.folio || '',
        clientName: incomingQuote.clientName || '',
        clientCompany: incomingQuote.clientCompany || '',
        clientTaxId: incomingQuote.clientTaxId || '',
        clientAddress: '',
        clientPhone: incomingQuote.clientPhone || '',
        clientEmail: incomingQuote.clientEmail || '',
        providerName: 'Gadiel Palma Ramos',
        providerTaxId: 'PARG990101XXX',
        providerAddress: 'Toluca, Estado de México',
        providerEmail: 'gadpalma7@gmail.com',
        providerPhone: '+52 722 365 9263',
        projectName: incomingQuote.items?.[0]?.name || (isRecurring ? 'Póliza de Mantenimiento & Soporte Continuo' : 'Desarrollo de Software a la Medida'),
        projectScope: scopeDesc || 'Servicios técnicos y mantenimiento según alcances especificados en la propuesta.',
        totalAmount: incomingQuote.total || 14000,
        currency: incomingQuote.currency || 'MXN',
        paymentScheme: paymentScheme,
        downPaymentAmount: isRecurring ? (incomingQuote.total || 0) : (incomingQuote.downPayment || ((incomingQuote.total || 0) * 0.5)),
        startDate: incomingQuote.startDate || new Date().toISOString().split('T')[0],
        deliveryWeeks: isRecurring ? (incomingQuote.recurringTermMonths ? Math.round(incomingQuote.recurringTermMonths * 4.33) : 52) : (incomingQuote.deliveryWeeks || 4),
        warrantyDays: isRecurring ? 0 : (incomingQuote.warrantyDays || 30),
        status: 'Pendiente de Firma',
        customClauses: customClauses
      });
      setViewMode('editor');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (onClearIncomingQuote) onClearIncomingQuote();
    }
  }, [incomingQuote]);

  // Cargar contratos
  const loadContracts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'contracts'));
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setContracts(list);
        localStorage.setItem('portfolio_contracts_backup', JSON.stringify(list));
      } else {
        const local = localStorage.getItem('portfolio_contracts_backup');
        if (local) setContracts(JSON.parse(local));
      }
    } catch (e) {
      console.warn('Fallback a localStorage:', e);
      const local = localStorage.getItem('portfolio_contracts_backup');
      if (local) setContracts(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const handleOpenCreate = () => {
    const contractNum = `CTR-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}`;
    setEditingId(null);
    setFormData({
      contractNumber: contractNum,
      quoteFolio: '',
      clientName: '',
      clientCompany: '',
      clientTaxId: '',
      clientAddress: '',
      clientPhone: '',
      clientEmail: '',
      providerName: 'Gadiel Palma Ramos',
      providerTaxId: 'PARG990101XXX',
      providerAddress: 'Toluca, Estado de México',
      providerEmail: 'gadpalma7@gmail.com',
      providerPhone: '+52 722 365 9263',
      projectName: 'Desarrollo de Software y Servicios Digitales',
      projectScope: 'Desarrollo e implementación de solución de software a la medida con arquitectura modular, diseño responsivo y optimización de rendimiento.',
      totalAmount: 14000,
      currency: 'MXN',
      paymentScheme: '50% anticipo al firmar y 50% contra entrega final y satisfacción.',
      downPaymentAmount: 7000,
      startDate: new Date().toISOString().split('T')[0],
      deliveryWeeks: 4,
      warrantyDays: 30,
      status: 'Borrador',
      customClauses: ''
    });
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setFormData(c);
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPreview = (c) => {
    setSelectedContract(c);
    setViewMode('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const payload = {
      ...formData,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'contracts', editingId), payload);
        const updated = contracts.map(c => c.id === editingId ? { ...c, ...payload, id: editingId } : c);
        setContracts(updated);
        localStorage.setItem('portfolio_contracts_backup', JSON.stringify(updated));
        setSelectedContract({ ...payload, id: editingId });
      } else {
        payload.createdAt = serverTimestamp();
        let newId = `contract_${Date.now()}`;
        try {
          const docRef = await addDoc(collection(db, 'contracts'), payload);
          newId = docRef.id;
        } catch {
          // Local fallback
        }
        const updated = [{ ...payload, id: newId }, ...contracts];
        setContracts(updated);
        localStorage.setItem('portfolio_contracts_backup', JSON.stringify(updated));
        setSelectedContract({ ...payload, id: newId });
      }
      setViewMode('preview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error guardando contrato:', err);
      alert('Se guardó localmente: ' + err.message);
      setViewMode('list');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este contrato?')) return;
    try {
      await deleteDoc(doc(db, 'contracts', id));
    } catch (e) {
      console.warn('Eliminado local:', e);
    }
    const filtered = contracts.filter(c => c.id !== id);
    setContracts(filtered);
    localStorage.setItem('portfolio_contracts_backup', JSON.stringify(filtered));
  };

  // Descarga Directa en PDF Real (.pdf)
  const handleExportPdf = async (c = selectedContract) => {
    if (!printDocumentRef.current) return;
    setIsExportingPdf(true);

    try {
      const element = printDocumentRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const filename = `Contrato_${c?.contractNumber || 'Doc'}_${(c?.clientName || 'Cliente').replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Error al generar PDF de contrato:', err);
      alert('Hubo un inconveniente al generar el PDF. Puedes usar la opción de Imprimir -> Guardar como PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const copyContractText = (c) => {
    const text = `
CONTRATO DE PRESTACIÓN DE SERVICIOS DE DESARROLLO DE SOFTWARE
NÚMERO: ${c.contractNumber}
${c.quoteFolio ? `REFERENCIA COTIZACIÓN: ${c.quoteFolio}` : ''}

REUNIDOS:
POR UNA PARTE: ${c.providerName}, en lo sucesivo denominado "EL PRESTADOR", con domicilio en ${c.providerAddress}, correo ${c.providerEmail} y teléfono ${c.providerPhone}.
POR OTRA PARTE: ${c.clientName}${c.clientCompany ? `, en representación de "${c.clientCompany}"` : ''}, en lo sucesivo denominado "EL CLIENTE", con RFC/ID ${c.clientTaxId || 'S/N'}, correo ${c.clientEmail || 'N/A'} y teléfono ${c.clientPhone || 'N/A'}.

CLÁUSULAS:
PRIMERA. OBJETO DEL CONTRATO: Desarrollo del software "${c.projectName}".
${c.projectScope}

SEGUNDA. PRECIO Y ESQUEMA DE PAGOS: $${Number(c.totalAmount).toLocaleString()} ${c.currency}.
${c.paymentScheme}

TERCERA. PLAZO DE EJECUCIÓN: Aproximadamente ${c.deliveryWeeks} semanas a partir de la firma y anticipo.

CUARTA. PROPIEDAD INTELECTUAL: Cesión total de derechos patrimoniales sobre el código fuente al liquidar el 100%.

QUINTA. CONFIDENCIALIDAD: NDA mutuo sobre credenciales, código y modelo de negocio.

SEXTA. GARANTÍA TÉCNICA: ${c.warrantyDays || 30} días naturales de garantía contra bugs post-despliegue.

SÉPTIMA. EXCLUSIONES: Costos de infraestructura externa (dominios, hosting, comisiones) a cargo de EL CLIENTE.

OCTAVA. JURISDICCIÓN: Tribunales de Toluca, Estado de México.

Fecha de suscripción: ${c.startDate}
_______________________         _______________________
${c.providerName}               ${c.clientName}
EL PRESTADOR                    EL CLIENTE
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const filteredContracts = contracts.filter(c =>
    (c.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.contractNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.projectName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // 1. MODO EDITOR A PÁGINA COMPLETA
  // ═════════════════════════════════════════════════════════════════════════════
  if (viewMode === 'editor') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '5rem' }}>
        
        {/* Barra Superior */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="btn btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <FiArrowLeft /> Volver a Contratos
            </button>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                {editingId ? `Editar Contrato ${formData.contractNumber}` : 'Nuevo Contrato Legal de Software'}
              </h2>
              <span className="muted" style={{ fontSize: '0.8rem' }}>Formulario estructurado a página completa</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="btn btn--ghost"
              style={{ fontSize: '0.85rem' }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn--accent"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, padding: '0.6rem 1.6rem' }}
            >
              <FiCheck /> Guardar & Ver Contrato
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Partes del Contrato */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* Prestador */}
            <div className="glass-card" style={{ padding: '1.8rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--accent, #00E5FF)', margin: '0 0 1rem 0' }}>Datos del Prestador de Servicios</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.providerName}
                    onChange={e => setFormData({ ...formData, providerName: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Domicilio Legal</label>
                  <input
                    type="text"
                    value={formData.providerAddress}
                    onChange={e => setFormData({ ...formData, providerAddress: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Email</label>
                    <input
                      type="email"
                      value={formData.providerEmail}
                      onChange={e => setFormData({ ...formData, providerEmail: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Teléfono</label>
                    <input
                      type="text"
                      value={formData.providerPhone}
                      onChange={e => setFormData({ ...formData, providerPhone: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cliente */}
            <div className="glass-card" style={{ padding: '1.8rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--accent, #00E5FF)', margin: '0 0 1rem 0' }}>Datos del Cliente Contratante</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Nombre o Razón Social *</label>
                  <input
                    required
                    type="text"
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Empresa / Organización</label>
                  <input
                    type="text"
                    value={formData.clientCompany}
                    onChange={e => setFormData({ ...formData, clientCompany: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>RFC / Identificación</label>
                    <input
                      type="text"
                      value={formData.clientTaxId}
                      onChange={e => setFormData({ ...formData, clientTaxId: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Teléfono</label>
                    <input
                      type="text"
                      value={formData.clientPhone}
                      onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff' }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Objeto del Contrato y Alcances */}
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--accent, #00E5FF)', margin: '0 0 1rem 0' }}>Objeto del Contrato & Entregables de Software</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Título del Proyecto</label>
                <input
                  required
                  type="text"
                  value={formData.projectName}
                  onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Alcance Detallado (Cláusula Primera)</label>
                <textarea
                  required
                  rows="5"
                  value={formData.projectScope}
                  onChange={e => setFormData({ ...formData, projectScope: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.88rem', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Honorarios, Esquema de Pagos y Plazos */}
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--accent, #00E5FF)', margin: '0 0 1.2rem 0' }}>Honorarios, Esquema de Pagos y Plazos Legales</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Monto Total Pactado</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formData.totalAmount}
                  onChange={e => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff', fontSize: '1rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Moneda</label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: '#070E22', border: '1px solid var(--border)', color: '#fff' }}
                >
                  <option value="MXN">Pesos Mexicanos (MXN)</option>
                  <option value="USD">Dólares Americanos (USD)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Plazo de Entrega (semanas)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.deliveryWeeks}
                  onChange={e => setFormData({ ...formData, deliveryWeeks: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Garantía Técnica (días naturales)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.warrantyDays}
                  onChange={e => setFormData({ ...formData, warrantyDays: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Modalidad de Liquidación / Esquema de Pagos (Cláusula Segunda)</label>
              <textarea
                rows="3"
                value={formData.paymentScheme}
                onChange={e => setFormData({ ...formData, paymentScheme: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="btn btn--ghost"
              style={{ padding: '0.7rem 1.5rem' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn--accent"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.7rem 2rem', fontSize: '0.95rem', fontWeight: 800 }}
            >
              <FiCheck /> Guardar Contrato & Ver Documento
            </button>
          </div>

        </form>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // 2. MODO VISTA PREVIA & EXPORTACIÓN A PDF REAL
  // ═════════════════════════════════════════════════════════════════════════════
  if (viewMode === 'preview' && selectedContract) {
    const c = selectedContract;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '6rem' }}>
        
        {/* Barra Superior */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              onClick={() => setViewMode('list')}
              className="btn btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <FiArrowLeft /> Volver al Listado
            </button>
            <button
              onClick={() => handleOpenEdit(c)}
              className="btn btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <FiEdit2 /> Editar Cláusulas
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* BOTÓN DESCARGA DIRECTA PDF */}
            <button
              onClick={() => handleExportPdf(c)}
              disabled={isExportingPdf}
              className="btn btn--accent"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.55rem 1.4rem', fontSize: '0.88rem', fontWeight: 700 }}
            >
              <FiDownload /> {isExportingPdf ? 'Generando PDF...' : 'Descargar Contrato (.pdf)'}
            </button>

            <button
              onClick={() => window.print()}
              className="btn btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <FiPrinter /> Imprimir
            </button>

            <button
              onClick={() => copyContractText(c)}
              className="btn btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              {copiedId === c.id ? <><FiCheck color="#4ADE80" /> Copiado</> : <><FiCopy /> Copiar Texto</>}
            </button>
          </div>
        </div>

        {/* DOCUMENTO LEGAL PARA PDF E IMPRESIÓN */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            id="contract-printable-document"
            ref={printDocumentRef}
            className="printable-card"
            style={{
              width: '100%',
              maxWidth: '850px',
              background: '#ffffff',
              color: '#0f172a',
              padding: '3.5rem 3.2rem',
              borderRadius: '12px',
              boxShadow: '0 20px 45px rgba(0,0,0,0.4)',
              boxSizing: 'border-box',
              fontFamily: 'serif'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2.5rem', borderBottom: '2px solid #0f172a', paddingBottom: '1.2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.4rem 0', color: '#0f172a' }}>
                Contrato de Prestación de Servicios de Desarrollo de Software
              </h2>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0284c7' }}>
                DOCUMENTO LEGAL NO. {c.contractNumber} {c.quoteFolio ? `• REF: ${c.quoteFolio}` : ''}
              </span>
            </div>

            <div style={{ fontSize: '0.94rem', lineHeight: 1.75, textAlign: 'justify', color: '#1e293b' }}>
              <p>
                En la ciudad de Toluca, Estado de México, comparecen por una parte <strong>{c.providerName}</strong>, con domicilio en {c.providerAddress}, correo electrónico {c.providerEmail} y teléfono {c.providerPhone}, en lo sucesivo denominado como <strong>"EL PRESTADOR"</strong>; y por la otra parte <strong>{c.clientName}</strong>{c.clientCompany ? `, en representación legal de "${c.clientCompany}"` : ''}, con identificación o RFC {c.clientTaxId || 'S/N'}, domicilio en {c.clientAddress || 'domicilio reportado por el cliente'}, correo {c.clientEmail || 'N/D'} y teléfono {c.clientPhone || 'N/D'}, en lo sucesivo denominado como <strong>"EL CLIENTE"</strong>. Ambas partes se reconocen mutuamente plena capacidad legal para obligarse al tenor de las siguientes:
              </p>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 900, marginTop: '1.6rem', marginBottom: '0.4rem', color: '#0f172a', textAlign: 'center', letterSpacing: '0.05em' }}>
                CLÁUSULAS
              </h4>

              <p>
                <strong>PRIMERA. OBJETO DEL CONTRATO.</strong> EL PRESTADOR se obliga a diseñar, programar, configurar y desplegar en favor de EL CLIENTE el software denominado <strong>"{c.projectName}"</strong>, conforme a los alcances, requerimientos técnicos y entregables que a continuación se estipulan:
              </p>
              
              <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '0.8rem 0', whiteSpace: 'pre-line', fontSize: '0.88rem', fontFamily: 'sans-serif', lineHeight: 1.6 }}>
                {c.projectScope}
              </div>

              <p>
                <strong>SEGUNDA. CONTRAPRESTACIÓN Y ESQUEMA DE PAGOS.</strong> Como retribución total y fija por los servicios pactados, EL CLIENTE pagará a EL PRESTADOR la suma de <strong>${Number(c.totalAmount).toLocaleString()} {c.currency}</strong>. Las partes convienen la siguiente modalidad de liquidación:
              </p>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '0.6rem 0', whiteSpace: 'pre-line', fontSize: '0.88rem', fontFamily: 'sans-serif' }}>
                {c.paymentScheme}
              </div>

              <p>
                <strong>TERCERA. PLAZO DE EJECUCIÓN Y CRONOGRAMA.</strong> EL PRESTADOR se compromete a finalizar y presentar el proyecto para validación en un periodo estimado de <strong>{c.deliveryWeeks} semanas</strong> a partir de la firma de este contrato y acreditación del anticipo correspondiente.
              </p>

              <p>
                <strong>CUARTA. PROPIEDAD INTELECTUAL Y CÓDIGO FUENTE.</strong> Una vez que EL CLIENTE haya cubierto el 100% del precio total estipulado en la Cláusula Segunda, EL PRESTADOR cede y transfiere a EL CLIENTE la totalidad de los derechos patrimoniales sobre el código fuente, bases de datos y diseños específicos desarrollados para este software. EL PRESTADOR conserva sus derechos morales inalienables y la potestad de exhibir capturas y descripción del proyecto en su portafolio profesional.
              </p>

              <p>
                <strong>QUINTA. CONFIDENCIALIDAD (NDA).</strong> Ambas partes se obligan a mantener estricto sigilo sobre cualquier información confidencial, código, arquitectura, datos de usuarios, claves de acceso o estrategias de negocio a las que tengan acceso en virtud del presente desarrollo.
              </p>

              <p>
                <strong>SEXTA. GARANTÍA Y SOPORTE POST-ENTREGA.</strong> EL PRESTADOR otorga una garantía técnica por un periodo de <strong>{c.warrantyDays || 30} días naturales</strong> posteriores al despliegue final en producción para solventar sin cargo alguno cualquier anomalía o fallo operativo atribuible al código fuente. Dicha garantía excluye solicitudes de cambios que modifiquen el alcance originalmente acordado.
              </p>

              <p>
                <strong>SÉPTIMA. COSTOS DE TERCEROS.</strong> Los costos asociados a servicios de infraestructura externos (tales como dominios web, servidores de alojamiento, suscripciones a bases de datos en la nube o comisiones por pasarelas de pago) son ajenos a los honorarios de desarrollo y corren por cuenta y cargo exclusivo de EL CLIENTE.
              </p>

              <p>
                <strong>OCTAVA. JURISDICCIÓN.</strong> Para cualquier controversia derivada del cumplimiento o interpretación de este contrato, las partes se someten expresamente a las leyes aplicables y a la jurisdicción de los tribunales de Toluca, Estado de México, renunciando a cualquier fuero por razón de sus domicilios presentes o futuros.
              </p>
            </div>

            {/* Espacios de Firma */}
            <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between', gap: '3rem', textAlign: 'center', fontSize: '0.9rem' }}>
              <div style={{ flex: 1, borderTop: '1px solid #475569', paddingTop: '0.8rem' }}>
                <strong style={{ color: '#0f172a' }}>{c.providerName}</strong>
                <span style={{ display: 'block', fontSize: '0.82rem', color: '#64748b' }}>EL PRESTADOR</span>
              </div>
              <div style={{ flex: 1, borderTop: '1px solid #475569', paddingTop: '0.8rem' }}>
                <strong style={{ color: '#0f172a' }}>{c.clientName}</strong>
                <span style={{ display: 'block', fontSize: '0.82rem', color: '#64748b' }}>EL CLIENTE</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // 3. MODO LISTADO PRINCIPAL
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
            <FiShield style={{ color: 'var(--accent, #00E5FF)' }} /> Contratos de Software
          </h2>
          <p className="muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
            Genera acuerdos legales formales con cesión de derechos de código, garantía de bugs por 30 días y descarga en PDF oficial.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Buscar por cliente o contrato..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.8rem 0.5rem 2rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <button onClick={handleOpenCreate} className="btn btn--accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', padding: '0.55rem 1.2rem', fontWeight: 700 }}>
            <FiPlus /> Nuevo Contrato
          </button>
        </div>
      </div>

      {/* Grid de Contratos */}
      {loading ? (
        <p className="muted">Cargando contratos...</p>
      ) : filteredContracts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
          <FiShield size={42} style={{ color: 'var(--muted)', marginBottom: '0.8rem', opacity: 0.6 }} />
          <p style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>No hay contratos registrados</p>
          <p className="muted" style={{ fontSize: '0.85rem', margin: '0.4rem 0 1.2rem 0' }}>
            Crea un contrato en blanco o conviértelo desde una cotización aprobada.
          </p>
          <button onClick={handleOpenCreate} className="btn btn--accent" style={{ fontSize: '0.88rem', padding: '0.55rem 1.4rem' }}>
            + Crear Contrato en Blanco
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.5rem' }}>
          {filteredContracts.map(c => {
            const statusColors = {
              Borrador: { bg: 'rgba(255,255,255,0.08)', text: '#cbd5e1' },
              'Pendiente de Firma': { bg: 'rgba(245, 158, 11, 0.15)', text: '#fcd34d' },
              Firmado: { bg: 'rgba(34, 197, 94, 0.15)', text: '#86efac' },
              'En Desarrollo': { bg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd' },
              Concluido: { bg: 'rgba(168, 85, 247, 0.15)', text: '#d8b4fe' }
            };
            const sc = statusColors[c.status] || statusColors.Borrador;

            return (
              <div
                key={c.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.2rem',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--accent, #00E5FF)' }}>{c.contractNumber}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px', background: sc.bg, color: sc.text }}>
                      {c.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.3rem 0', color: '#fff', fontWeight: 800 }}>{c.clientName}</h3>
                  <p className="muted" style={{ fontSize: '0.84rem', margin: 0 }}>
                    {c.clientCompany ? `🏢 ${c.clientCompany} • ` : ''}{c.projectName}
                  </p>

                  <div style={{ marginTop: '1rem', padding: '0.9rem', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)' }}>
                      <span>Monto Total:</span>
                      <span style={{ color: '#38BDF8', fontWeight: 700 }}>${Number(c.totalAmount).toLocaleString()} {c.currency}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)' }}>
                      <span>Plazo de entrega:</span>
                      <span style={{ color: '#fff' }}>{c.deliveryWeeks} semanas</span>
                    </div>
                    {c.quoteFolio && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' }}>
                        <span>Cotización Ref:</span>
                        <span>{c.quoteFolio}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.9rem' }}>
                  <button
                    onClick={() => handleOpenPreview(c)}
                    className="btn btn--accent"
                    style={{ flex: 1.4, padding: '0.45rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 700 }}
                  >
                    <FiDownload /> Ver & PDF
                  </button>

                  <button
                    onClick={() => copyContractText(c)}
                    className="btn btn--ghost"
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    title="Copiar texto para Word o Google Docs"
                  >
                    {copiedId === c.id ? <FiCheck color="#4ADE80" /> : <FiCopy />} Texto
                  </button>

                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="btn btn--ghost"
                    style={{ padding: '0.45rem 0.6rem', fontSize: '0.82rem' }}
                    title="Editar contrato"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="btn btn--ghost"
                    style={{ padding: '0.45rem 0.6rem', fontSize: '0.82rem', color: '#f87171' }}
                    title="Eliminar"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
