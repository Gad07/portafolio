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
  FiSend,
  FiCopy,
  FiCheck,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiArrowRight,
  FiArrowLeft,
  FiSearch,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard,
  FiGlobe
} from 'react-icons/fi';

const QUICK_SERVICES = [
  { name: 'Landing Page / One-Page', price: 3000, desc: 'Brochure digital interactivo de alta conversión de una sola página.' },
  { name: 'Sitio Web Básico (hasta 5 secciones)', price: 8000, desc: 'Web institucional completa y responsive con estructura estándar.' },
  { name: 'Sitio Web Corporativo (5 a 15 secciones)', price: 14000, desc: 'Portal empresarial con SEO local y captación de prospectos.' },
  { name: 'E-commerce Estándar', price: 14000, desc: 'Tienda en línea comercial con catálogo y pasarela de pagos.' },
  { name: 'E-commerce Avanzado con Facturación', price: 18000, desc: 'Tienda con sincronización de inventario y facturación SAT CFDI 4.0.' },
  { name: 'Sistema POS / Punto de Venta', price: 18000, desc: 'Sistema web para mostrador, tickets de compra y cortes de caja.' },
  { name: 'Sistema CRM a la Medida', price: 17000, desc: 'Panel para seguimiento de prospectos, embudos de venta y cotizaciones.' },
  { name: 'Sistema ERP a la Medida', price: 15000, desc: 'Administración de almacén, compras a proveedores y flujos de caja.' },
  { name: 'Aplicación Móvil (iOS / Android)', price: 15000, desc: 'Desarrollo de app con React Native y backend conectado.' },
  { name: 'Plataforma Web Avanzada / SaaS', price: 20000, desc: 'Software como servicio (SaaS) con arquitecturas de alta concurrencia.' }
];


const BILLING_CYCLES = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'bimonthly', label: 'Bimestral' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'biannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' }
];

const RECURRING_SERVICES = [
  { 
    name: 'Póliza Mantenimiento Esencial', 
    price: 1500, 
    desc: 'Monitoreo 24/7, respaldos mensuales en la nube, parches de seguridad y 3 horas de soporte técnico mensual.' 
  },
  { 
    name: 'Póliza Mantenimiento Integral + Bolsa 10h', 
    price: 3500, 
    desc: 'Monitoreo proactivo, respaldos semanales, parches SSL, SLA prioritario (<4h) y 10 horas mensuales para desarrollo de mejoras y soporte.' 
  },
  { 
    name: 'Póliza DevOps & Infraestructura Cloud', 
    price: 5500, 
    desc: 'Gestión y escalabilidad en AWS/GCP/Vercel, pipelines CI/CD, base de datos de alta disponibilidad y 20 horas de ingeniería.' 
  },
  { 
    name: 'Póliza de Mantenimiento Anual Prepago', 
    price: 15000, 
    desc: 'Cobertura completa integral por 12 meses con descuento preferencial por pago anual anticipado.' 
  }
];

const DEFAULT_MAINTENANCE_SCOPE = [
  '• Monitoreo proactivo de disponibilidad (uptime 24/7) y estado de salud de servicios web.',
  '• Respaldo periódico automatizado de base de datos y archivos del sistema en almacenamiento seguro en la nube (Cloud Backups).',
  '• Aplicación preventiva de parches de seguridad, renovación de certificados SSL y actualización de dependencias.',
  '• Corrección prioritaria de incidencias técnicas (bug fixes), depuración de errores de ejecución y optimización de velocidad.',
  '• Bolsa mensual de horas para desarrollo de mejoras continuas, adaptaciones visuales o implementación de nuevas secciones.',
  '• Soporte técnico directo vía WhatsApp y correo con canal de comunicación prioritario y atención personalizada.',
  '• Reporte ejecutivo periódico de estabilidad del sistema, estado de infraestructura y métricas operativas.',
  '• Exclusiones: No comprende costos directos de consumo de servidores Cloud, compra de dominios ni rediseños integrales de sistema.'
].join('\n');

const ADDONS = [
  { name: 'Panel CMS Administrable a la medida', price: 1500 },
  { name: 'Pasarela de Pagos (Stripe / Mercado Pago / PayPal)', price: 1500 },
  { name: 'Automatización de Notificaciones / WhatsApp API', price: 2500 },
  { name: 'Soporte Multilenguaje adicional', price: 500 }
];

export default function QuotesManager({ onGenerateContract }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modos de visualización: 'list' | 'editor' | 'preview'
  const [viewMode, setViewMode] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState(null);

  const printDocumentRef = useRef(null);
  const pageQuoteRef = useRef(null);
  const pageScopeRef = useRef(null);

  // Helper para calcular fecha de entrega final a partir de inicio + semanas
  const calculateDeliveryDate = (startDateStr, weeks) => {
    if (!startDateStr) return '';
    const [year, month, day] = startDateStr.split('-').map(Number);
    if (!year || !month || !day) return '';
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + (Number(weeks) || 0) * 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayStr}`;
  };

  // Helper para calcular fecha límite de vigencia a partir de fecha base + días
  const calculateValidityDate = (baseDateStr, days) => {
    if (!baseDateStr) return '';
    const [year, month, day] = baseDateStr.split('-').map(Number);
    if (!year || !month || !day) return '';
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + (Number(days) || 0));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayStr}`;
  };

  // Helper para calcular días entre dos fechas (YYYY-MM-DD)
  const calculateDaysBetween = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return 15;
    const [y1, m1, day1] = startDateStr.split('-').map(Number);
    const [y2, m2, day2] = endDateStr.split('-').map(Number);
    if (!y1 || !y2) return 15;
    const dateObj1 = new Date(y1, m1 - 1, day1);
    const dateObj2 = new Date(y2, m2 - 1, day2);
    const diffDays = Math.round((dateObj2 - dateObj1) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const DEFAULT_SCOPE = [
    '• Desarrollo de arquitectura front-end y lógica de negocio totalmente modular y responsive.',
    '• Diseño UI/UX interactivo adaptado a identidad corporativa y optimizado para móviles y escritorio.',
    '• Integración de base de datos, autenticación de usuarios y APIs correspondientes.',
    '• Despliegue en entorno productivo (Hosting / Vercel / Cloud) con certificado SSL activo.',
    '• Capacitación técnica operativa para la administración y entrega de accesos correspondientes.',
    '• 30 días de garantía técnica y soporte post-entrega para resolución de incidencias atribuibles al código.',
    '• Exclusiones: No comprende costos directos de pasarelas de pago, servidores ni APIs de terceros.'
  ].join('\n');

  // Form State
  const [formData, setFormData] = useState({
    folio: '',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientTaxId: '',
    currency: 'MXN',
    date: new Date().toISOString().split('T')[0],
    validityDays: 15,
    validityDate: calculateValidityDate(new Date().toISOString().split('T')[0], 15),
    status: 'Borrador',
    // Fechas Probables de Entrega
    startDate: new Date().toISOString().split('T')[0],
    finalDeliveryDate: '',
    deliveryWeeks: 4,
    // Propuesta Recurrente vs Proyecto Único
    proposalType: 'project', // 'project' | 'recurring'
    billingCycle: 'monthly',
    billingCycleLabel: 'Mensual',
    recurringTermMonths: 12,
    recurringHoursIncluded: 10,
    recurringHourlyOverage: 350,
    recurringBillingRule: 'Pago anticipado los primeros 5 días naturales de cada ciclo',
    recurringSlaResponse: 'Incidencias críticas < 4 horas hábiles; requerimientos regulares < 24 horas hábiles',
    // Alcances y Entregables del Proyecto
    projectScope: DEFAULT_SCOPE,
    // Calendario de Pagos en Hitos
    applyPaymentSchedule: true,
    paymentMilestones: [
      { id: 1, title: 'Anticipo inicial y arranque', percent: 50, dueDate: '', condition: 'Firma de contrato y recepción de requerimientos iniciales' },
      { id: 2, title: 'Entrega de avance funcional y pruebas beta', percent: 25, dueDate: '', condition: 'Validación en servidor de pruebas / staging' },
      { id: 3, title: 'Entrega final y puesta en marcha', percent: 25, dueDate: '', condition: 'Despliegue final en producción y entrega de accesos' }
    ],
    items: [
      { name: 'Sitio Web Corporativo', description: 'Desarrollo web a la medida con arquitectura modular, SEO técnico y diseño Bento responsive.', quantity: 1, unitPrice: 14000 }
    ],
    discountPercent: 0,
    discountCondition: 'Aplica en la contratación de ambos proyectos en conjunto',
    includeTax: false,
    taxPercent: 16,
    downPaymentPercent: 50,
    warrantyDays: 30,
    notes: 'Incluye despliegue en servidor de producción, certificado SSL y 30 días de garantía técnica post-entrega para corrección de bugs.'
  });

  // Cargar cotizaciones
  const loadQuotes = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'quotes'));
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setQuotes(list);
        localStorage.setItem('portfolio_quotes_backup', JSON.stringify(list));
      } else {
        const local = localStorage.getItem('portfolio_quotes_backup');
        if (local) setQuotes(JSON.parse(local));
      }
    } catch (e) {
      console.warn('Fallback a localStorage:', e);
      const local = localStorage.getItem('portfolio_quotes_backup');
      if (local) setQuotes(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  // Ir a Crear Nueva Cotización
  const handleOpenCreate = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const initialWeeks = 4;
    const finalDateStr = calculateDeliveryDate(todayStr, initialWeeks);
    const validityDateStr = calculateValidityDate(todayStr, 15);

    const folioNum = String(quotes.length + 1).padStart(3, '0');
    setEditingId(null);
    setFormData({
      folio: `COT-${today.getFullYear()}-${folioNum}`,
      clientName: '',
      clientCompany: '',
      clientEmail: '',
      clientPhone: '',
      clientTaxId: '',
      currency: 'MXN',
      date: todayStr,
      validityDays: 15,
      validityDate: validityDateStr,
      status: 'Borrador',
      startDate: todayStr,
      finalDeliveryDate: finalDateStr,
      deliveryWeeks: initialWeeks,
      proposalType: 'project',
      billingCycle: 'monthly',
      billingCycleLabel: 'Mensual',
      recurringTermMonths: 12,
      recurringHoursIncluded: 10,
      recurringHourlyOverage: 350,
      recurringBillingRule: 'Pago anticipado los primeros 5 días naturales de cada ciclo',
      recurringSlaResponse: 'Incidencias críticas < 4 horas hábiles; requerimientos regulares < 24 horas hábiles',
      projectScope: DEFAULT_SCOPE,
      applyPaymentSchedule: true,
      paymentMilestones: [
        { id: 1, title: 'Anticipo inicial y arranque', percent: 50, dueDate: todayStr, condition: 'Firma de acuerdo y recepción de requerimientos iniciales' },
        { id: 2, title: 'Avance funcional y pruebas intermedias', percent: 25, dueDate: '', condition: 'Presentación en servidor de pruebas' },
        { id: 3, title: 'Entrega final y puesta en marcha', percent: 25, dueDate: finalDateStr, condition: 'Despliegue en producción y entrega de accesos' }
      ],
      items: [
        { name: 'Sitio Web Corporativo', description: 'Desarrollo web a la medida con arquitectura modular, SEO técnico y diseño Bento responsive.', quantity: 1, unitPrice: 14000 }
      ],
      discountPercent: 0,
      discountCondition: 'Aplica en la contratación de ambos proyectos en conjunto',
      includeTax: false,
      taxPercent: 16,
      downPaymentPercent: 50,
      warrantyDays: 30,
      notes: 'Incluye despliegue en servidor de producción, certificado SSL y 30 días de garantía técnica post-entrega para corrección de bugs.'
    });
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ir a Editar Cotización
  const handleOpenEdit = (q) => {
    setEditingId(q.id);
    const valDays = q.validityDays || 15;
    const valDate = q.validityDate || calculateValidityDate(q.date || new Date().toISOString().split('T')[0], valDays);

    setFormData({
      ...q,
      validityDays: valDays,
      validityDate: valDate,
      proposalType: q.proposalType || 'project',
      billingCycle: q.billingCycle || 'monthly',
      billingCycleLabel: q.billingCycleLabel || 'Mensual',
      recurringTermMonths: q.recurringTermMonths !== undefined ? q.recurringTermMonths : 12,
      recurringHoursIncluded: q.recurringHoursIncluded !== undefined ? q.recurringHoursIncluded : 10,
      recurringHourlyOverage: q.recurringHourlyOverage !== undefined ? q.recurringHourlyOverage : 350,
      recurringBillingRule: q.recurringBillingRule || 'Pago anticipado los primeros 5 días naturales de cada ciclo',
      recurringSlaResponse: q.recurringSlaResponse || 'Incidencias críticas < 4 horas hábiles; requerimientos regulares < 24 horas hábiles',
      projectScope: q.projectScope || (q.proposalType === 'recurring' ? DEFAULT_MAINTENANCE_SCOPE : DEFAULT_SCOPE),
      discountCondition: q.discountCondition !== undefined ? q.discountCondition : 'Aplica en la contratación de ambos proyectos en conjunto',
      items: q.items || [],
      paymentMilestones: q.paymentMilestones || [
        { id: 1, title: 'Anticipo inicial y arranque', percent: 50, dueDate: q.startDate || '', condition: 'Firma de acuerdo' },
        { id: 2, title: 'Entrega final y puesta en marcha', percent: 50, dueDate: q.finalDeliveryDate || '', condition: 'Despliegue y entrega' }
      ]
    });
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ir a Vista Previa
  const handleOpenPreview = (q) => {
    setSelectedQuote(q);
    setViewMode('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cálculos de Totales
  const calculateTotals = (data = formData) => {
    const subtotal = (data.items || []).reduce((acc, it) => acc + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0), 0);
    const discountAmount = subtotal * ((Number(data.discountPercent) || 0) / 100);
    const subAfterDiscount = subtotal - discountAmount;
    const taxAmount = data.includeTax ? subAfterDiscount * ((Number(data.taxPercent) || 16) / 100) : 0;
    const total = subAfterDiscount + taxAmount;
    const downPayment = total * ((Number(data.downPaymentPercent) || 50) / 100);
    const balance = total - downPayment;

    // Calcular montos de cada hito
    const milestonesCalculated = (data.paymentMilestones || []).map(m => ({
      ...m,
      amount: Math.round(total * ((Number(m.percent) || 0) / 100))
    }));

    const milestonesPercentSum = (data.paymentMilestones || []).reduce((acc, m) => acc + (Number(m.percent) || 0), 0);

    return { subtotal, discountAmount, subAfterDiscount, taxAmount, total, downPayment, balance, milestonesCalculated, milestonesPercentSum };
  };

  const totals = calculateTotals();

  // Guardar Cotización
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const finalTotals = calculateTotals(formData);
    const payload = {
      ...formData,
      ...finalTotals,
      paymentMilestones: finalTotals.milestonesCalculated,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'quotes', editingId), payload);
        const updated = quotes.map(q => q.id === editingId ? { ...q, ...payload, id: editingId } : q);
        setQuotes(updated);
        localStorage.setItem('portfolio_quotes_backup', JSON.stringify(updated));
        setSelectedQuote({ ...payload, id: editingId });
      } else {
        payload.createdAt = serverTimestamp();
        let newId = `quote_${Date.now()}`;
        try {
          const docRef = await addDoc(collection(db, 'quotes'), payload);
          newId = docRef.id;
        } catch {
          // Local fallback
        }
        const updated = [{ ...payload, id: newId }, ...quotes];
        setQuotes(updated);
        localStorage.setItem('portfolio_quotes_backup', JSON.stringify(updated));
        setSelectedQuote({ ...payload, id: newId });
      }
      setViewMode('preview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error guardando cotización:', err);
      alert('Se guardó localmente: ' + err.message);
      setViewMode('list');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta cotización?')) return;
    try {
      await deleteDoc(doc(db, 'quotes', id));
    } catch (e) {
      console.warn('Eliminado local:', e);
    }
    const filtered = quotes.filter(q => q.id !== id);
    setQuotes(filtered);
    localStorage.setItem('portfolio_quotes_backup', JSON.stringify(filtered));
  };

  // Descarga Directa en PDF Real (.pdf) sin cortes de contenido
  const handleExportPdf = async (q = selectedQuote, mode = 'all') => {
    setIsExportingPdf(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297; // Altura estándar A4 en mm

      const capturePage = async (element) => {
        if (!element) return null;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        return { imgData, imgHeight };
      };

      // Función que añade una página o bloque al PDF asegurando que NADA se corte
      const addPageToPdf = (pdfDoc, pageData, isFirstPage = false) => {
        if (!pageData) return;
        const imgHeight = pageData.imgHeight;
        const imgData = pageData.imgData;

        // Si excede el A4 por poco (hasta ~25%), ajustamos escala proporcional para que quepa en 1 sola hoja perfecta
        if (imgHeight <= pdfHeight * 1.25) {
          if (!isFirstPage) pdfDoc.addPage();
          if (imgHeight > pdfHeight) {
            const scale = (pdfHeight - 2) / imgHeight;
            const scaledWidth = pdfWidth * scale;
            const scaledHeight = imgHeight * scale;
            const offsetX = (pdfWidth - scaledWidth) / 2;
            pdfDoc.addImage(imgData, 'PNG', offsetX, 0, scaledWidth, scaledHeight);
          } else {
            pdfDoc.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
          }
        } else {
          // Si es significativamente más largo, dividir en páginas continuas sin corte
          let heightLeft = imgHeight;
          let position = 0;

          if (!isFirstPage) pdfDoc.addPage();
          pdfDoc.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;

          while (heightLeft > 5) {
            position = -(imgHeight - heightLeft);
            pdfDoc.addPage();
            pdfDoc.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
          }
        }
      };

      const folioClean = (q?.folio || 'Doc').replace(/[^a-zA-Z0-9_-]/g, '_');
      const clientClean = (q?.clientName || 'Cliente').replace(/\s+/g, '_');

      if (mode === 'quote') {
        const el = pageQuoteRef.current || printDocumentRef.current;
        const page1 = await capturePage(el);
        if (page1) {
          addPageToPdf(pdf, page1, true);
          pdf.save(`Cotizacion_${folioClean}_${clientClean}.pdf`);
        }
      } else if (mode === 'scope') {
        const page2 = await capturePage(pageScopeRef.current);
        if (page2) {
          addPageToPdf(pdf, page2, true);
          pdf.save(`Alcances_Tecnicos_${folioClean}_${clientClean}.pdf`);
        }
      } else {
        // Modo 'all': Página 1 Cotización y Página 2 Alcances
        const page1 = await capturePage(pageQuoteRef.current || printDocumentRef.current);
        if (page1) {
          addPageToPdf(pdf, page1, true);
        }

        if (pageScopeRef.current) {
          const page2 = await capturePage(pageScopeRef.current);
          if (page2) {
            addPageToPdf(pdf, page2, false);
          }
        }

        pdf.save(`Propuesta_Integral_${folioClean}_${clientClean}.pdf`);
      }
    } catch (err) {
      console.error('Error al generar PDF:', err);
      alert('Hubo un inconveniente al generar el PDF. Puedes usar el botón de Imprimir -> Guardar como PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const copyWhatsAppSummary = (q) => {
    const valDate = q.validityDate || calculateValidityDate(q.date, q.validityDays || 15);
    const isRecurring = q.proposalType === 'recurring';

    let text;
    if (isRecurring) {
      text = [
        `🔁 *PROPUESTA DE PÓLIZA DE MANTENIMIENTO — GADIEL PALMA*`,
        `📄 Folio: ${q.folio}`,
        `👤 Cliente: ${q.clientName} ${q.clientCompany ? `(${q.clientCompany})` : ''}`,
        `📅 Fecha de Emisión: ${q.date}`,
        `⏳ *Válida hasta:* ${valDate} (${q.validityDays || 15} días naturales)`,
        ``,
        `📋 *MODALIDAD & CONDICIONES DE LA PÓLIZA:*`,
        `• Periodicidad: Cuota *${q.billingCycleLabel || 'Mensual'}*`,
        `• Plazo Mínimo: ${q.recurringTermMonths === 0 ? 'Sin plazo forzoso (renovación periódica)' : `${q.recurringTermMonths} meses de compromiso`}`,
        `• Bolsa de Horas: *${q.recurringHoursIncluded || 10} horas* de soporte y mejoras incluidas por ciclo`,
        `• Tarifa Hora Excedente: ${q.recurringHourlyOverage || 350} ${q.currency}/hr`,
        `• SLA de Respuesta: ${q.recurringSlaResponse || 'Crítico < 4h / General < 24h'}`,
        ``,
        `📌 *SERVICIOS COMPRENDIDOS:*`,
        ...(q.items || []).map(it => `• *${it.name}*: ${Number(it.unitPrice * (it.quantity || 1)).toLocaleString()} ${q.currency} / ${q.billingCycleLabel || 'mes'}\n  _${it.description || ''}_`),
        ``,
        `💳 *FACTURACIÓN & COBRO:*`,
        `• Regla: ${q.recurringBillingRule || 'Pago anticipado los primeros 5 días naturales de cada ciclo'}`,
        ``,
        `💰 *CUOTA POR PERÍODO (${(q.billingCycleLabel || 'MENSUAL').toUpperCase()}):* ${Math.round(q.total || 0).toLocaleString()} ${q.currency}`,
        (q.recurringTermMonths > 1) ? `📈 *Inversión estimada anual/contrato (${q.recurringTermMonths} meses):* ${Math.round((q.total || 0) * (q.recurringTermMonths || 12)).toLocaleString()} ${q.currency}` : '',
        `_Propuesta sujeta a los alcances y SLA del Anexo A adjunto._`
      ].filter(Boolean).join('\n');
    } else {
      text = [
      `💼 *COTIZACIÓN DE SOFTWARE — GADIEL PALMA*`,
      `📄 Folio: ${q.folio}`,
      `👤 Cliente: ${q.clientName} ${q.clientCompany ? `(${q.clientCompany})` : ''}`,
      `📅 Fecha de Emisión: ${q.date}`,
      `⏳ *Válida hasta:* ${valDate} (${q.validityDays || 15} días naturales)`,
      ``,
      `⏱️ *CRONOGRAMA & FECHAS ESTIMADAS:*`,
      `• Fecha de Inicio: ${q.startDate || 'Inmediata'}`,
      `• Fecha Probable de Entrega Final: ${q.finalDeliveryDate || 'A convenir'} (${q.deliveryWeeks || 4} semanas)`,
      ``,
      `📌 *SERVICIOS & ENTREGABLES:*`,
      ...(q.items || []).map(it => `• *${it.name}* (x${it.quantity}): $${Number(it.unitPrice * it.quantity).toLocaleString()} ${q.currency}\n  _${it.description || ''}_`),
      ``,
      q.discountAmount > 0 ? `🏷️ *Descuento Especial (${q.discountPercent}%):* -$${Math.round(q.discountAmount).toLocaleString()} ${q.currency}${q.discountCondition ? `\n   _(Condición: ${q.discountCondition})_` : ''}\n` : '',
      q.applyPaymentSchedule && q.paymentMilestones?.length > 0 ? [
        `💳 *CALENDARIO DE PAGOS EN HITOS:*`,
        ...q.paymentMilestones.map(m => `• ${m.title} (${m.percent}%): $${Number(m.amount).toLocaleString()} ${q.currency} ${m.dueDate ? `[Vence: ${m.dueDate}]` : ''}`)
      ].join('\n') : `💳 *Anticipo:* ${q.downPaymentPercent || 50}% ($${Math.round(q.downPayment || 0).toLocaleString()} ${q.currency}) y ${100 - (q.downPaymentPercent || 50)}% contra entrega final`,
      ``,
      `💰 *Total de Inversión:* $${Math.round(q.total || 0).toLocaleString()} ${q.currency}`,
      `🛡️ *Garantía Técnica:* ${q.warrantyDays || 30} días post-entrega contra bugs`,
      `_Vigencia de la propuesta comercial: Hasta el ${valDate}._`
    ].filter(Boolean).join('\n');

    }
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Manejadores de items
  const addItem = (item = { name: '', description: '', quantity: 1, unitPrice: 0 }) => {
    setFormData(prev => ({ ...prev, items: [...prev.items, item] }));
  };

  const removeItem = (idx) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const updateItem = (idx, field, val) => {
    setFormData(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: val };
      return { ...prev, items };
    });
  };

  // Manejadores de hitos
  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      paymentMilestones: [
        ...prev.paymentMilestones,
        { id: Date.now(), title: 'Nuevo Hito de Pago', percent: 20, dueDate: '', condition: 'Entrega de módulo acordado' }
      ]
    }));
  };

  const removeMilestone = (idx) => {
    setFormData(prev => ({
      ...prev,
      paymentMilestones: prev.paymentMilestones.filter((_, i) => i !== idx)
    }));
  };

  const updateMilestone = (idx, field, val) => {
    setFormData(prev => {
      const ms = [...prev.paymentMilestones];
      ms[idx] = { ...ms[idx], [field]: val };
      return { ...prev, paymentMilestones: ms };
    });
  };

  const filteredQuotes = quotes.filter(q =>
    (q.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.clientCompany || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.folio || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // 1. MODO EDITOR A PÁGINA COMPLETA (NO POP-UP)
  // ═════════════════════════════════════════════════════════════════════════════
  if (viewMode === 'editor') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '5rem' }}>
        
        {/* Barra Superior de Navegación del Editor */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="btn btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <FiArrowLeft /> Volver a Cotizaciones
            </button>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                {editingId ? `Editar Cotización ${formData.folio}` : 'Nueva Cotización de Proyecto'}
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
              <FiCheck /> Guardar & Ver Propuesta
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* SECCIÓN 1: DATOS DEL CLIENTE Y MONEDA */}
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            
            {/* Selector de Modalidad: Proyecto vs Póliza Recurrente */}
            <div style={{ marginBottom: '1.8rem', display: 'flex', gap: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.45rem', borderRadius: '12px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    proposalType: 'project',
                    applyPaymentSchedule: true
                  }));
                }}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '0.75rem 1.2rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: formData.proposalType !== 'recurring' ? 'color-mix(in srgb, var(--accent, #00E5FF) 25%, transparent)' : 'transparent',
                  color: formData.proposalType !== 'recurring' ? '#FFFFFF' : 'var(--muted)',
                  outline: formData.proposalType !== 'recurring' ? '1.5px solid var(--accent, #00E5FF)' : 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                💼 Proyecto Cerrado (Entrega Única)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => {
                    const isCurrentlyRecurring = prev.proposalType === 'recurring';
                    const newItems = isCurrentlyRecurring ? prev.items : [
                      { name: RECURRING_SERVICES[1].name, description: RECURRING_SERVICES[1].desc, quantity: 1, unitPrice: RECURRING_SERVICES[1].price }
                    ];
                    return {
                      ...prev,
                      proposalType: 'recurring',
                      billingCycle: prev.billingCycle || 'monthly',
                      billingCycleLabel: prev.billingCycleLabel || 'Mensual',
                      items: newItems,
                      projectScope: prev.projectScope && prev.projectScope !== DEFAULT_SCOPE ? prev.projectScope : DEFAULT_MAINTENANCE_SCOPE,
                      applyPaymentSchedule: false
                    };
                  });
                }}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '0.75rem 1.2rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: formData.proposalType === 'recurring' ? 'color-mix(in srgb, #38BDF8 25%, transparent)' : 'transparent',
                  color: formData.proposalType === 'recurring' ? '#FFFFFF' : 'var(--muted)',
                  outline: formData.proposalType === 'recurring' ? '1.5px solid #38BDF8' : 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                🔁 Póliza Recurrente (Mantenimiento & Soporte)
              </button>
            </div>

            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent, #00E5FF)', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser /> 1. Datos del Cliente & Folio Comercial
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Folio Oficial</label>
                <input
                  required
                  type="text"
                  value={formData.folio}
                  onChange={e => setFormData({ ...formData, folio: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--accent, #00E5FF)', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Nombre del Cliente / Contacto *</label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Ing. Carlos Mendoza"
                  value={formData.clientName}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Empresa / Razón Social</label>
                <input
                  type="text"
                  placeholder="Ej. Inmobiliaria del Valle S.A."
                  value={formData.clientCompany}
                  onChange={e => setFormData({ ...formData, clientCompany: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>RFC o Identificación</label>
                <input
                  type="text"
                  placeholder="Ej. IVA990101XXX"
                  value={formData.clientTaxId}
                  onChange={e => setFormData({ ...formData, clientTaxId: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Teléfono / WhatsApp</label>
                <input
                  type="text"
                  placeholder="+52 722 123 4567"
                  value={formData.clientPhone}
                  onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="contacto@empresa.com"
                  value={formData.clientEmail}
                  onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Moneda</label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: '#070E22', border: '1px solid var(--border)', color: '#fff' }}
                >
                  <option value="MXN">🇲🇽 Pesos Mexicanos (MXN)</option>
                  <option value="USD">🇺🇸 Dólares Americanos (USD)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Estado de Propuesta</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: '#070E22', border: '1px solid var(--border)', color: '#fff' }}
                >
                  <option value="Borrador">Borrador</option>
                  <option value="Enviada">Enviada</option>
                  <option value="Aprobada">Aprobada</option>
                  <option value="Rechazada">Rechazada</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: FECHAS PROBABLES DE ENTREGA O CONDICIONES DE PÓLIZA */}
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent, #00E5FF)', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCalendar /> {formData.proposalType === 'recurring' ? '2. Periodicidad, Plazo & Bolsa de Horas de Mantenimiento' : '2. Fechas Probables de Entrega & Cronograma Técnico'}
            </h3>

            {formData.proposalType === 'recurring' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Periodicidad de Cobro *</label>
                  <select
                    value={formData.billingCycle}
                    onChange={e => {
                      const cycle = BILLING_CYCLES.find(b => b.value === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        billingCycle: e.target.value,
                        billingCycleLabel: cycle ? cycle.label : 'Mensual'
                      }));
                    }}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: '#070E22', border: '1px solid var(--border)', color: '#38BDF8', fontWeight: 700 }}
                  >
                    {BILLING_CYCLES.map(b => (
                      <option key={b.value} value={b.value}>Cuota {b.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Plazo Mínimo de Compromiso</label>
                  <select
                    value={formData.recurringTermMonths}
                    onChange={e => setFormData({ ...formData, recurringTermMonths: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: '#070E22', border: '1px solid var(--border)', color: '#fff' }}
                  >
                    <option value={0}>Sin plazo forzoso (Cancelable mes a mes)</option>
                    <option value={3}>3 Meses</option>
                    <option value={6}>6 Meses</option>
                    <option value={12}>12 Meses (1 Año sugerido)</option>
                    <option value={24}>24 Meses (2 Años)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Bolsa Mensual de Horas Incluidas</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.recurringHoursIncluded}
                    onChange={e => setFormData({ ...formData, recurringHoursIncluded: Number(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                  />
                  <span className="muted" style={{ fontSize: '0.75rem' }}>Para mejoras, soporte técnico y cambios menores</span>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Tarifa Hora Excedente ({formData.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.recurringHourlyOverage}
                    onChange={e => setFormData({ ...formData, recurringHourlyOverage: Number(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                  />
                  <span className="muted" style={{ fontSize: '0.75rem' }}>Costo por hora al superar la bolsa mensual</span>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Fecha de Emisión</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => {
                      const newDate = e.target.value;
                      const autoValDate = calculateValidityDate(newDate, formData.validityDays);
                      setFormData(prev => ({
                        ...prev,
                        date: newDate,
                        validityDate: autoValDate
                      }));
                    }}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Fecha Inicio de Cobertura</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Regla de Facturación / Cobro</label>
                  <input
                    type="text"
                    value={formData.recurringBillingRule}
                    onChange={e => setFormData({ ...formData, recurringBillingRule: e.target.value })}
                    placeholder="Ej. Pago anticipado los primeros 5 días naturales de cada ciclo"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Nivel de Servicio (SLA)</label>
                  <input
                    type="text"
                    value={formData.recurringSlaResponse}
                    onChange={e => setFormData({ ...formData, recurringSlaResponse: e.target.value })}
                    placeholder="Ej. Incidencias críticas < 4h; solicitudes generales < 24h"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                  />
                </div>
              </div>
            ) : (

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Fecha de Emisión</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => {
                    const newDate = e.target.value;
                    const autoValDate = calculateValidityDate(newDate, formData.validityDays);
                    setFormData(prev => ({
                      ...prev,
                      date: newDate,
                      validityDate: autoValDate
                    }));
                  }}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Fecha Probable de Inicio</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => {
                    const newStart = e.target.value;
                    const autoFinal = calculateDeliveryDate(newStart, formData.deliveryWeeks);
                    setFormData(prev => ({
                      ...prev,
                      startDate: newStart,
                      finalDeliveryDate: autoFinal
                    }));
                  }}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Duración Total (semanas)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.deliveryWeeks}
                  onChange={e => {
                    const newWeeks = Number(e.target.value) || 0;
                    const autoFinal = calculateDeliveryDate(formData.startDate, newWeeks);
                    setFormData(prev => ({
                      ...prev,
                      deliveryWeeks: newWeeks,
                      finalDeliveryDate: autoFinal
                    }));
                  }}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Fecha Probable de Entrega Final</label>
                <input
                  type="date"
                  value={formData.finalDeliveryDate}
                  onChange={e => setFormData({ ...formData, finalDeliveryDate: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Vigencia Límite (Fecha de Vencimiento)</label>
                <input
                  type="date"
                  value={formData.validityDate}
                  onChange={e => {
                    const newValidityDate = e.target.value;
                    const days = calculateDaysBetween(formData.date, newValidityDate);
                    setFormData(prev => ({
                      ...prev,
                      validityDate: newValidityDate,
                      validityDays: days
                    }));
                  }}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#38BDF8', fontWeight: 700 }}
                />
                <span className="muted" style={{ fontSize: '0.75rem' }}>Equivale a {formData.validityDays || 0} días naturales</span>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Vigencia en Días Naturales</label>
                <input
                  type="number"
                  min="1"
                  value={formData.validityDays}
                  onChange={e => {
                    const days = Number(e.target.value) || 0;
                    const newValidityDate = calculateValidityDate(formData.date, days);
                    setFormData(prev => ({
                      ...prev,
                      validityDays: days,
                      validityDate: newValidityDate
                    }));
                  }}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                />
                <span className="muted" style={{ fontSize: '0.75rem' }}>Vence el {formData.validityDate || 'N/D'}</span>
              </div>
            </div>
            )}
          </div>

          {/* SECCIÓN 3: SERVICIOS Y CONCEPTOS */}
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--accent, #00E5FF)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiFileText /> 3. Servicios & Desglose de Alcance
              </h3>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <select
                  onChange={e => {
                    if (!e.target.value) return;
                    const isRec = formData.proposalType === 'recurring';
                    const list = isRec ? RECURRING_SERVICES : QUICK_SERVICES;
                    const s = list[Number(e.target.value)];
                    if (s) addItem({ name: s.name, description: s.desc, quantity: 1, unitPrice: s.price });
                    e.target.value = '';
                  }}
                  style={{ padding: '0.45rem 0.8rem', borderRadius: '8px', background: '#070E22', border: '1px solid var(--border)', color: '#93C5FD', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">{formData.proposalType === 'recurring' ? '+ Insertar Póliza de Mantenimiento...' : '+ Insertar del Tabulador Oficial 2026...'}</option>
                  {(formData.proposalType === 'recurring' ? RECURRING_SERVICES : QUICK_SERVICES).map((s, idx) => (
                    <option key={idx} value={idx}>{s.name} (${s.price.toLocaleString()} MXN {formData.proposalType === 'recurring' ? ('/ ' + (formData.billingCycleLabel || 'mes')) : ''})</option>
                  ))}
                </select>

                <button type="button" onClick={() => addItem()} className="btn btn--ghost" style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}>
                  + Concepto Personalizado
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formData.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1.2rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: '3 1 250px' }}>
                      <input
                        required
                        type="text"
                        placeholder="Nombre del servicio o módulo"
                        value={it.name}
                        onChange={e => updateItem(idx, 'name', e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}
                      />
                    </div>
                    <div style={{ width: '80px' }}>
                      <input
                        type="number"
                        min="1"
                        placeholder="Cant."
                        value={it.quantity}
                        onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.9rem', textAlign: 'center' }}
                      />
                    </div>
                    <div style={{ width: '140px' }}>
                      <input
                        required
                        type="number"
                        min="0"
                        placeholder={formData.proposalType === 'recurring' ? ('Cuota / ' + (formData.billingCycleLabel || 'Ciclo')) : 'Precio Unit.'}
                        value={it.unitPrice}
                        onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.9rem', textAlign: 'right' }}
                      />
                    </div>
                    <div style={{ minWidth: '110px', textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: '#38BDF8' }}>
                      ${((it.quantity || 1) * (it.unitPrice || 0)).toLocaleString()} {formData.currency}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={formData.items.length === 1}
                      style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.4rem', opacity: formData.items.length === 1 ? 0.3 : 1 }}
                      title="Quitar concepto"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <textarea
                    rows="2"
                    placeholder="Descripción detallada del alcance, funcionalidades y entregables comprendidos..."
                    value={it.description}
                    onChange={e => updateItem(idx, 'description', e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--muted)', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>
              ))}
            </div>

            {/* Módulos rápidos en 1 clic */}
            <div style={{ marginTop: '1.2rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>+ Módulos Rápidos:</span>
              {ADDONS.map((add, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addItem({ name: add.name, description: 'Módulo configurado e implementado a la medida.', quantity: 1, unitPrice: add.price })}
                  className="chip"
                  style={{ fontSize: '0.8rem', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  + {add.name} (+${add.price} {formData.currency})
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN NUEVA: ALCANCES GENERALES Y ENTREGABLES DEL PROYECTO */}
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--accent, #00E5FF)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCheckCircle /> 4. Alcances Generales, Entregables & Exclusiones del Proyecto
                </h3>
                <p className="muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
                  Especifica claramente qué comprende el proyecto, responsabilidades técnicas y límites de alcance para el cliente y PDF.
                </p>
              </div>

              {/* Botones para insertar puntos frecuentes */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    projectScope: (prev.projectScope ? prev.projectScope + '\n' : '') + '• Desarrollo responsive y optimizado para experiencia móvil (PWA/Bento Design).'
                  }))}
                  className="chip"
                  style={{ fontSize: '0.78rem', cursor: 'pointer', background: 'rgba(255,255,255,0.04)' }}
                >
                  + Móvil / Responsive
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    projectScope: DEFAULT_MAINTENANCE_SCOPE
                  }))}
                  className="chip"
                  style={{ fontSize: '0.78rem', cursor: 'pointer', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.35)' }}
                >
                  + Cargar Alcances Póliza Mantenimiento & SLA
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    projectScope: (prev.projectScope ? prev.projectScope + '\n' : '') + '• Despliegue en servidor de producción con certificado SSL activo y dominio conectado.'
                  }))}
                  className="chip"
                  style={{ fontSize: '0.78rem', cursor: 'pointer', background: 'rgba(255,255,255,0.04)' }}
                >
                  + Despliegue / SSL
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    projectScope: (prev.projectScope ? prev.projectScope + '\n' : '') + '• Exclusiones: Los costos de servidores, hosting, dominios y licencias de terceros corren por cuenta del cliente.'
                  }))}
                  className="chip"
                  style={{ fontSize: '0.78rem', cursor: 'pointer', background: 'rgba(255,255,255,0.04)' }}
                >
                  + Exclusiones (Hosting/APIs)
                </button>
              </div>
            </div>

            <textarea
              rows="6"
              placeholder="Describe con viñetas los alcances técnicos, entregables y exclusiones del proyecto..."
              value={formData.projectScope}
              onChange={e => setFormData({ ...formData, projectScope: e.target.value })}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.88rem', lineHeight: 1.5, resize: 'vertical' }}
            />
          </div>

          {/* SECCIÓN 5: ESQUEMA DE PAGO */}
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            {formData.proposalType === 'recurring' ? (
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#38BDF8', margin: '0 0 0.6rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiClock /> 5. Esquema de Póliza Recurrente & Facturación Periódica
                </h3>
                <p className="muted" style={{ margin: '0 0 1.2rem 0', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Esta propuesta comercial opera como póliza continua. La cuota se liquida periódicamente según la regla establecida.
                </p>

                <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '1.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Modalidad de Cobro:</span>
                    <strong style={{ color: '#fff', fontSize: '0.92rem' }}>Cuota {formData.billingCycleLabel} Anticipada</strong>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>{formData.recurringBillingRule}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Plazo Contractual:</span>
                    <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{formData.recurringTermMonths === 0 ? 'Sin plazo forzoso (mes a mes)' : (formData.recurringTermMonths + ' meses de compromiso')}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>Renovación automática al término</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Bolsa Mensual Incluida:</span>
                    <strong style={{ color: '#38BDF8', fontSize: '0.92rem' }}>{formData.recurringHoursIncluded} horas / ciclo</strong>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>Hora adicional: ${formData.recurringHourlyOverage} {formData.currency}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Compromiso SLA:</span>
                    <strong style={{ color: '#4ADE80', fontSize: '0.92rem' }}>Atención Prioritaria</strong>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>{formData.recurringSlaResponse}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--accent, #00E5FF)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiClock /> 5. Esquema & Calendario de Pagos
                    </h3>
                    <p className="muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
                      Configura si el proyecto se liquida bajo un calendario de entregables o esquema tradicional.
                    </p>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <input
                      type="checkbox"
                      checked={formData.applyPaymentSchedule}
                      onChange={e => setFormData({ ...formData, applyPaymentSchedule: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent, #00E5FF)' }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>¿Aplica Calendario de Pagos en Hitos?</span>
                  </label>
                </div>

                {formData.applyPaymentSchedule ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: totals.milestonesPercentSum === 100 ? '#4ADE80' : '#F87171', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                    {totals.milestonesPercentSum === 100 ? <FiCheckCircle /> : <FiAlertCircle />}
                    Suma de porcentajes de hitos: {totals.milestonesPercentSum}% {totals.milestonesPercentSum !== 100 && '(Debe sumar 100%)'}
                  </span>

                  <button
                    type="button"
                    onClick={addMilestone}
                    className="btn btn--ghost"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    + Agregar Hito de Pago
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {formData.paymentMilestones.map((m, idx) => {
                    const milestoneAmount = Math.round(totals.total * ((Number(m.percent) || 0) / 100));

                    return (
                      <div
                        key={m.id || idx}
                        style={{
                          padding: '1.2rem',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 110px 40px',
                          gap: '0.8rem',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Hito #{idx + 1} - Concepto</label>
                          <input
                            type="text"
                            value={m.title}
                            onChange={e => updateMilestone(idx, 'title', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Porcentaje (%)</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={m.percent}
                            onChange={e => updateMilestone(idx, 'percent', Number(e.target.value))}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Fecha Estimada de Pago</label>
                          <input
                            type="date"
                            value={m.dueDate}
                            onChange={e => updateMilestone(idx, 'dueDate', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Condición de Liberación</label>
                          <input
                            type="text"
                            value={m.condition}
                            onChange={e => updateMilestone(idx, 'condition', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Monto Hito</span>
                          <span style={{ fontWeight: 800, color: '#38BDF8', fontSize: '0.95rem' }}>
                            ${milestoneAmount.toLocaleString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeMilestone(idx)}
                          disabled={formData.paymentMilestones.length <= 1}
                          style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', opacity: formData.paymentMilestones.length <= 1 ? 0.3 : 1 }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>% de Anticipo Inicial</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={formData.downPaymentPercent}
                    onChange={e => setFormData({ ...formData, downPaymentPercent: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                  />
                  <span className="muted" style={{ fontSize: '0.75rem' }}>El {100 - formData.downPaymentPercent}% restante se liquida contra entrega final</span>
                </div>
              </div>
            )}
              </div>
            )}
          </div>

          {/* SECCIÓN 5: DESGLOSE ECONÓMICO Y NOTAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--accent, #00E5FF)', margin: '0 0 1rem 0' }}>Términos y Garantía</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Garantía Técnica Post-Entrega (días)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.warrantyDays}
                    onChange={e => setFormData({ ...formData, warrantyDays: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Notas & Especificaciones Adicionales</label>
                  <textarea
                    rows="3"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.8rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 0.5rem 0' }}>Resumen Financiero</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--muted)' }}>
                <span>Subtotal Bruto:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>${totals.subtotal.toLocaleString()} {formData.currency}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Descuento Comercial (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discountPercent}
                  onChange={e => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                  style={{ width: '80px', padding: '0.4rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.85rem', textAlign: 'right' }}
                />
              </div>

              {formData.discountPercent > 0 && (
                <div style={{ background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.25)', borderRadius: '8px', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4ADE80', fontWeight: 700 }}>
                    <span>Descuento aplicado:</span>
                    <span>-${Math.round(totals.discountAmount).toLocaleString()} {formData.currency}</span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#86efac', display: 'block', marginBottom: '0.2rem' }}>
                      Condición / Justificación del Descuento:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Aplica en la contratación de ambos proyectos en conjunto"
                      value={formData.discountCondition}
                      onChange={e => setFormData({ ...formData, discountCondition: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(74, 222, 128, 0.3)', color: '#fff', fontSize: '0.8rem' }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, discountCondition: 'Aplica en la contratación de ambos proyectos en conjunto' })}
                        style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#cbd5e1', cursor: 'pointer' }}
                      >
                        + Ambos Proyectos
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, discountCondition: 'Aplica por pago en una sola exhibición (Contado)' })}
                        style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#cbd5e1', cursor: 'pointer' }}
                      >
                        + Pago de Contado
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, discountCondition: 'Aplica por cierre y firma antes del vencimiento de la cotización' })}
                        style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#cbd5e1', cursor: 'pointer' }}
                      >
                        + Pronto Cierre
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.includeTax}
                    onChange={e => setFormData({ ...formData, includeTax: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent, #00E5FF)' }}
                  />
                  Aplicar Impuesto IVA (16%)
                </label>
                <span style={{ fontSize: '0.9rem', color: formData.includeTax ? '#fff' : 'var(--muted)' }}>
                  +${Math.round(totals.taxAmount).toLocaleString()} {formData.currency}
                </span>
              </div>

              <div style={{ borderTop: '2px solid rgba(255,255,255,0.15)', paddingTop: '0.8rem', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff' }}>
                  {formData.proposalType === 'recurring' ? ('CUOTA (' + (formData.billingCycleLabel || 'MENSUAL').toUpperCase() + '):') : 'TOTAL FINAL:'}
                </span>
                <span style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--accent, #00E5FF)' }}>
                  ${Math.round(totals.total).toLocaleString()} {formData.currency}
                  {formData.proposalType === 'recurring' && <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)' }}> / {(formData.billingCycleLabel || 'mes').toLowerCase()}</span>}
                </span>
              </div>
            </div>

          </div>

          {/* BOTONES FINALES DE GUARDADO */}
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
              <FiCheck /> Guardar Cotización & Ver Propuesta
            </button>
          </div>

        </form>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // 2. MODO VISTA PREVIA & EXPORTACIÓN A PDF REAL (PÁGINA COMPLETA)
  // ═════════════════════════════════════════════════════════════════════════════
  if (viewMode === 'preview' && selectedQuote) {
    const q = selectedQuote;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '6rem' }}>
        
        {/* Barra de Acciones de Vista Previa */}
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
              onClick={() => handleOpenEdit(q)}
              className="btn btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <FiEdit2 /> Editar Datos
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* BOTONES DE DESCARGA PDF */}
            <button
              onClick={() => handleExportPdf(q, 'all')}
              disabled={isExportingPdf}
              className="btn btn--accent"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.55rem 1.3rem', fontSize: '0.88rem', fontWeight: 700 }}
              title="Descarga un PDF de 2 páginas: Página 1 Cotización y Página 2 Alcances Técnicos"
            >
              <FiDownload /> {isExportingPdf ? 'Generando PDF...' : 'Descargar PDF (2 Páginas: Cotización + Alcances)'}
            </button>

            <button
              onClick={() => handleExportPdf(q, 'quote')}
              disabled={isExportingPdf}
              className="btn btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
              title="Descarga exclusivamente la Página 1 de Cotización Comercial"
            >
              <FiFileText /> Solo Cotización
            </button>

            <button
              onClick={() => handleExportPdf(q, 'scope')}
              disabled={isExportingPdf}
              className="btn btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
              title="Descarga exclusivamente la Página 2 del Anexo de Alcances Técnicos"
            >
              <FiCheckCircle /> Solo Alcances
            </button>

            <button
              onClick={() => window.print()}
              className="btn btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <FiPrinter /> Imprimir
            </button>

            <button
              onClick={() => copyWhatsAppSummary(q)}
              className="btn btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              {copiedId === q.id ? <><FiCheck color="#4ADE80" /> Copiado</> : <><FiSend /> WhatsApp</>}
            </button>

            <button
              onClick={() => onGenerateContract && onGenerateContract(q)}
              className="btn btn--accent"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              📜 Generar Contrato <FiArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* CONTENEDOR DE AMBAS PÁGINAS SEPARADAS */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
          
          {/* ══════════════════════════════════════════════════════════════════════
              PÁGINA 1: PROPUESTA COMERCIAL & COTIZACIÓN
             ══════════════════════════════════════════════════════════════════════ */}
          <div
            id="quote-printable-page-1"
            ref={pageQuoteRef}
            className="printable-card"
            style={{
              width: '100%',
              maxWidth: '800px',
              background: '#ffffff',
              color: '#0f172a',
              padding: '1.8rem 2.2rem',
              borderRadius: '12px',
              boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
              boxSizing: 'border-box'
            }}
          >
            {/* Encabezado Membretado */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #0284c7', paddingBottom: '0.9rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.1rem' }}>
                  {q.proposalType === 'recurring' ? 'PROPUESTA DE PÓLIZA DE MANTENIMIENTO & SOPORTE' : 'COTIZACIÓN DE PROYECTO DE SOFTWARE'}
                </span>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  GADIEL PALMA
                </h1>
                <p style={{ margin: '0.15rem 0', fontSize: '0.8rem', color: '#0284c7', fontWeight: 800 }}>
                  INGENIERÍA DE SOFTWARE & ARQUITECTURAS FULL-STACK
                </p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  Toluca, Estado de México • gadpalma7@gmail.com • (722) 365-9263
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', fontWeight: 900, padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.92rem' }}>
                  {q.folio}
                </span>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  <strong>Fecha Emisión:</strong> {q.date}
                </p>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
                  <strong>Válida hasta:</strong> {q.validityDate || calculateValidityDate(q.date, q.validityDays || 15)} ({q.validityDays || 15} días)
                </p>
              </div>
            </div>

            {/* Datos del Cliente y Fechas Clave */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.9rem', marginBottom: '1rem' }}>
              
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' }}>
                  Propuesta Comercial Presentada A:
                </span>
                <h2 style={{ fontSize: '1.05rem', margin: 0, color: '#0f172a', fontWeight: 900 }}>
                  {q.clientName}
                </h2>
                {q.clientCompany && (
                  <p style={{ margin: '0.15rem 0', fontSize: '0.82rem', color: '#334155', fontWeight: 700 }}>
                    {q.clientCompany}
                  </p>
                )}
                {q.clientTaxId && <p style={{ margin: '0.1rem 0', fontSize: '0.75rem', color: '#64748b' }}>RFC: {q.clientTaxId}</p>}
                <div style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: '#64748b' }}>
                  {q.clientPhone && <div>📞 {q.clientPhone}</div>}
                  {q.clientEmail && <div>✉️ {q.clientEmail}</div>}
                </div>
              </div>

              {q.proposalType === 'recurring' ? (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.3rem' }}>
                    Modalidad de Cobertura & Periodicidad:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Periodicidad de Cobro:</span>
                      <strong style={{ color: '#0284c7' }}>Cuota {q.billingCycleLabel || 'Mensual'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Plazo de Compromiso:</span>
                      <strong style={{ color: '#0f172a' }}>{q.recurringTermMonths === 0 ? 'Sin plazo forzoso (mes a mes)' : (q.recurringTermMonths + ' meses')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #bae6fd', paddingTop: '0.25rem', marginTop: '0.15rem' }}>
                      <span style={{ color: '#64748b' }}>Bolsa Mensual Incluida:</span>
                      <strong style={{ color: '#0f172a' }}>{q.recurringHoursIncluded || 10} horas / ciclo</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.3rem' }}>
                    Fechas Probables de Entrega & Cronograma:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Fecha de Inicio:</span>
                      <strong style={{ color: '#0f172a' }}>{q.startDate || 'Inmediata'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Entrega Final & Puesta en Marcha:</span>
                      <strong style={{ color: '#0284c7' }}>{q.finalDeliveryDate || 'A convenir'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #bae6fd', paddingTop: '0.25rem', marginTop: '0.15rem' }}>
                      <span style={{ color: '#64748b' }}>Duración Estimada:</span>
                      <strong style={{ color: '#0f172a' }}>{q.deliveryWeeks || 4} semanas</strong>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Tabla de Servicios y Desglose Económico */}
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                Desglose Económico de Servicios
              </span>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 0.8rem', borderRadius: '5px 0 0 0' }}>Servicio / Módulo</th>
                    <th style={{ padding: '0.5rem 0.8rem', textAlign: 'center', width: '60px' }}>Cant.</th>
                    <th style={{ padding: '0.5rem 0.8rem', textAlign: 'right', width: '110px' }}>{q.proposalType === 'recurring' ? 'Cuota / Período' : 'Precio Unit.'}</th>
                    <th style={{ padding: '0.5rem 0.8rem', textAlign: 'right', width: '110px', borderRadius: '0 5px 0 0' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(q.items || []).map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.55rem 0.8rem' }}>
                        <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.84rem' }}>{it.name}</strong>
                        {it.description && <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '0.15rem', lineHeight: 1.35 }}>{it.description}</span>}
                      </td>
                      <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', color: '#334155' }}>{it.quantity}</td>
                      <td style={{ padding: '0.55rem 0.8rem', textAlign: 'right', color: '#334155' }}>
                        ${Number(it.unitPrice).toLocaleString()} {q.currency}
                      </td>
                      <td style={{ padding: '0.55rem 0.8rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        ${Number(it.quantity * it.unitPrice).toLocaleString()} {q.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TABLA DE CALENDARIO DE PAGOS EN HITOS (SI APLICA) */}
            {q.applyPaymentSchedule && q.paymentMilestones?.length > 0 && (
              <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                  Calendario de Pagos por Hitos y Entregables
                </span>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#e2e8f0', color: '#1e293b', textAlign: 'left' }}>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Hito / Entregable</th>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', width: '55px' }}>%</th>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', width: '95px' }}>Fecha Prog.</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Condición de Liberación</th>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right', width: '95px' }}>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.paymentMilestones.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.45rem 0.6rem', fontWeight: 600, color: '#0f172a' }}>{m.title}</td>
                        <td style={{ padding: '0.45rem 0.6rem', textAlign: 'center', color: '#64748b' }}>{m.percent}%</td>
                        <td style={{ padding: '0.45rem 0.6rem', textAlign: 'center', color: '#64748b' }}>{m.dueDate || 'N/D'}</td>
                        <td style={{ padding: '0.45rem 0.6rem', color: '#475569', fontSize: '0.75rem' }}>{m.condition || 'Contra aprobación'}</td>
                        <td style={{ padding: '0.45rem 0.6rem', textAlign: 'right', fontWeight: 700, color: '#0369a1' }}>
                          ${Number(m.amount).toLocaleString()} {q.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Condiciones y Desglose Financiero */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.4rem', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
              <div style={{ flex: 1.2, fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                {q.proposalType === 'recurring' ? (
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.3rem' }}>Términos de la Póliza Recurrente:</strong>
                    <p style={{ margin: '0 0 0.25rem 0' }}>• Facturación & Cobro: Cuota <strong>{q.billingCycleLabel || 'Mensual'}</strong> ({q.recurringBillingRule || 'Pago anticipado los primeros 5 días naturales de cada ciclo'}).</p>
                    <p style={{ margin: '0 0 0.25rem 0' }}>• Plazo mínimo: <strong>{q.recurringTermMonths === 0 ? 'Sin plazo forzoso (renovación periódica)' : (q.recurringTermMonths + ' meses de compromiso con renovación automática')}</strong>.</p>
                    <p style={{ margin: '0 0 0.25rem 0' }}>• Bolsa mensual de horas: <strong>{q.recurringHoursIncluded || 10} horas incluidas por ciclo</strong> (Tarifa hora excedente: ${q.recurringHourlyOverage || 350} {q.currency}/hr).</p>
                    <p style={{ margin: '0 0 0.25rem 0' }}>• Nivel de Servicio (SLA): <strong>{q.recurringSlaResponse || 'Incidencias críticas < 4h; solicitudes generales < 24h'}</strong>.</p>
                    <p style={{ margin: '0 0 0.25rem 0' }}>• Vigencia de propuesta: Válida hasta el <strong>{q.validityDate || calculateValidityDate(q.date, q.validityDays || 15)}</strong> ({q.validityDays || 15} días naturales).</p>
                    <p style={{ margin: '0 0 0.25rem 0' }}>• {q.notes}</p>
                  </div>
                ) : (
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.3rem' }}>Términos del Servicio:</strong>
                    <p style={{ margin: '0 0 0.25rem 0' }}>• Vigencia de la cotización: Válida hasta el <strong>{q.validityDate || calculateValidityDate(q.date, q.validityDays || 15)}</strong> ({q.validityDays || 15} días naturales).</p>
                    {!q.applyPaymentSchedule && (
                      <p style={{ margin: '0 0 0.25rem 0' }}>• Esquema de pago: <strong>{q.downPaymentPercent || 50}% de anticipo inicial</strong> y <strong>{100 - (q.downPaymentPercent || 50)}%</strong> contra entrega final.</p>
                    )}
                    {q.discountPercent > 0 && q.discountCondition && (
                      <p style={{ margin: '0 0 0.25rem 0', color: '#15803d' }}>
                        • Condición de Descuento ({q.discountPercent}%): <strong>{q.discountCondition}</strong>.
                      </p>
                    )}
                    <p style={{ margin: '0 0 0.25rem 0' }}>• Garantía técnica: <strong>{q.warrantyDays || 30} días naturales</strong> posteriores al despliegue para resolución de bugs atribuibles al código.</p>
                    <p style={{ margin: '0 0 0.25rem 0' }}>• {q.notes}</p>
                  </div>
                )}
              </div>

              <div style={{ flex: 1, background: '#f8fafc', padding: '0.9rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.3rem' }}>
                  <span>Subtotal:</span>
                  <span>${Math.round(q.subtotal || 0).toLocaleString()} {q.currency}</span>
                </div>
                {q.discountAmount > 0 && (
                  <div style={{ marginBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                      <span>Descuento ({q.discountPercent}%):</span>
                      <span>-${Math.round(q.discountAmount).toLocaleString()}</span>
                    </div>
                    {q.discountCondition && (
                      <span style={{ fontSize: '0.7rem', color: '#15803d', fontStyle: 'italic', display: 'block', marginTop: '1px', textAlign: 'right' }}>
                        * {q.discountCondition}
                      </span>
                    )}
                  </div>
                )}
                {q.taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '0.3rem' }}>
                    <span>IVA (16%):</span>
                    <span>+${Math.round(q.taxAmount).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ borderTop: '2px solid #0f172a', paddingTop: '0.5rem', marginTop: '0.3rem', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>
                  <span>{q.proposalType === 'recurring' ? ('CUOTA (' + (q.billingCycleLabel || 'MENSUAL').toUpperCase() + '):') : 'TOTAL:'}</span>
                  <span style={{ color: '#0284c7' }}>${Math.round(q.total || 0).toLocaleString()} {q.currency}</span>
                </div>
                {q.proposalType === 'recurring' && q.recurringTermMonths > 1 && (
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'right', marginTop: '2px' }}>
                    Inversión estimada anual/contrato: ${Math.round((q.total || 0) * q.recurringTermMonths).toLocaleString()} {q.currency}
                  </div>
                )}
              </div>
            </div>

            {/* Firmas al pie */}
            <div style={{ marginTop: '1.8rem', display: 'flex', justifyContent: 'space-between', gap: '3rem', textAlign: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: '40px' }}></div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.45rem', fontSize: '0.78rem', color: '#475569' }}>
                  <strong style={{ display: 'block', color: '#0f172a' }}>Gadiel Palma Ramos</strong>
                  Desarrollador Full-Stack & Prestador
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: '40px' }}></div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.45rem', fontSize: '0.78rem', color: '#475569' }}>
                  <strong style={{ display: 'block', color: '#0f172a' }}>{q.clientName}</strong>
                  Aceptación de Propuesta Comercial
                </div>
              </div>
            </div>

            {/* Pie de página institucional Página 1 */}
            <div style={{ marginTop: '1.1rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
              <span>Folio: {q.folio} • {q.clientCompany || q.clientName}</span>
              <span>Página 1 de 2 • Cotización sujeta a los Alcances Técnicos detallados en el Anexo A adjunto</span>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              PÁGINA 2: ANEXO TÉCNICO DE ALCANCES, ENTREGABLES & EXCLUSIONES
             ══════════════════════════════════════════════════════════════════════ */}
          <div
            id="quote-printable-page-2"
            ref={pageScopeRef}
            className="printable-card"
            style={{
              width: '100%',
              maxWidth: '800px',
              background: '#ffffff',
              color: '#0f172a',
              padding: '1.8rem 2.2rem',
              borderRadius: '12px',
              boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
              boxSizing: 'border-box'
            }}
          >
            {/* Encabezado Membretado de Anexo Técnico */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #0284c7', paddingBottom: '0.9rem', marginBottom: '1.1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.15rem' }}>
                  {q.proposalType === 'recurring' ? 'DOCUMENTO ANEXO A — PÓLIZA DE MANTENIMIENTO & SLA' : 'DOCUMENTO ANEXO A — ESPECIFICACIONES TÉCNICAS'}
                </span>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  {q.proposalType === 'recurring' ? 'ALCANCE DE LA PÓLIZA & NIVELES DE SERVICIO' : 'ALCANCES, ENTREGABLES & COBERTURA'}
                </h1>
                <p style={{ margin: '0.15rem 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Gadiel Palma Ramos • Toluca, Estado de México • gadpalma7@gmail.com
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-block', background: '#f1f5f9', color: '#334155', fontWeight: 800, padding: '0.25rem 0.7rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                  Ref: {q.folio}
                </span>
                <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  <strong>Cliente:</strong> {q.clientName}
                </p>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  <strong>Fecha de Referencia:</strong> {q.date}
                </p>
              </div>
            </div>

            {/* Resumen de Módulos Contratados */}
            <div style={{ marginBottom: '1.1rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                1. Módulos & Componentes de Software a Desarrollar
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(q.items || []).map((it, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '0.7rem 0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>
                        1.{idx + 1} {it.name}
                      </strong>
                      <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', fontWeight: 700, padding: '2px 7px', borderRadius: '4px' }}>
                        Cantidad: {it.quantity}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                      {it.description || 'Desarrollo, pruebas y despliegue del componente acordado.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Alcances Técnicos Generales */}
            <div style={{ marginBottom: '1.1rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.9rem 1rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                2. Especificación de Alcances Técnicos & Entregables
              </span>
              <div style={{ fontSize: '0.79rem', color: '#334155', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                {q.projectScope || '• Desarrollo e implementación del sistema según especificaciones acordadas en la cotización comercial.'}
              </div>
            </div>

            {/* Firmas de Conformidad de Alcances */}
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', gap: '3rem', textAlign: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: '48px' }}></div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                  <strong style={{ display: 'block', color: '#0f172a' }}>Gadiel Palma Ramos</strong>
                  Desarrollador Responsable
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: '48px' }}></div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                  <strong style={{ display: 'block', color: '#0f172a' }}>{q.clientName}</strong>
                  Conformidad de Alcance Técnico
                </div>
              </div>
            </div>

            {/* Pie de página institucional Página 2 */}
            <div style={{ marginTop: '1.1rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
              <span>Folio: {q.folio} • {q.clientCompany || q.clientName}</span>
              <span>Página 2 de 2 • Anexo Técnico de Alcances vinculado al Folio {q.folio}</span>
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
      
      {/* Encabezado y Barra de Acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
            <FiFileText style={{ color: 'var(--accent, #00E5FF)' }} /> Cotizaciones de Clientes
          </h2>
          <p className="muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
            Genera propuestas comerciales con calendario de pagos, fechas probables de entrega y descarga en PDF oficial.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Buscar por cliente o folio..."
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
            <FiPlus /> Nueva Cotización
          </button>
        </div>
      </div>

      {/* Grid de Cotizaciones */}
      {loading ? (
        <p className="muted">Cargando cotizaciones...</p>
      ) : filteredQuotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
          <FiFileText size={42} style={{ color: 'var(--muted)', marginBottom: '0.8rem', opacity: 0.6 }} />
          <p style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>No hay cotizaciones registradas</p>
          <p className="muted" style={{ fontSize: '0.85rem', margin: '0.4rem 0 1.2rem 0' }}>
            Comienza creando una propuesta comercial profesional con calendario de pagos y fechas estimadas.
          </p>
          <button onClick={handleOpenCreate} className="btn btn--accent" style={{ fontSize: '0.88rem', padding: '0.55rem 1.4rem' }}>
            + Crear Nueva Cotización
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.5rem' }}>
          {filteredQuotes.map(q => {
            const statusColors = {
              Borrador: { bg: 'rgba(255,255,255,0.08)', text: '#cbd5e1' },
              Enviada: { bg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd' },
              Aprobada: { bg: 'rgba(34, 197, 94, 0.15)', text: '#86efac' },
              Rechazada: { bg: 'rgba(239, 68, 68, 0.15)', text: '#fca5a5' }
            };
            const sc = statusColors[q.status] || statusColors.Borrador;

            return (
              <div
                key={q.id}
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
                    <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--accent, #00E5FF)' }}>{q.folio}</span>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {q.proposalType === 'recurring' && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8' }}>
                          🔁 {q.billingCycleLabel || 'Póliza'}
                        </span>
                      )}
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px', background: sc.bg, color: sc.text }}>
                        {q.status}
                      </span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.3rem 0', color: '#fff', fontWeight: 800 }}>{q.clientName || 'Cliente sin nombre'}</h3>
                  {q.clientCompany && <p className="muted" style={{ fontSize: '0.84rem', margin: 0 }}>🏢 {q.clientCompany}</p>}

                  {/* Resumen de Datos Clave */}
                  <div style={{ marginTop: '1rem', padding: '0.9rem', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)' }}>
                      <span>Conceptos:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{(q.items || []).length} servicio(s)</span>
                    </div>

                    {q.proposalType === 'recurring' ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)' }}>
                        <span>Modalidad:</span>
                        <span style={{ color: '#38BDF8', fontWeight: 600 }}>Cuota {q.billingCycleLabel || 'Mensual'}</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)' }}>
                        <span>Entrega estimada:</span>
                        <span style={{ color: '#fff' }}>{q.finalDeliveryDate || `${q.deliveryWeeks || 4} sem.`}</span>
                      </div>
                    )}

                    {q.applyPaymentSchedule && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#38BDF8' }}>
                        <span>Esquema:</span>
                        <span>Calendario en {q.paymentMilestones?.length || 3} hitos</span>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.4rem', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>
                      <span>{q.proposalType === 'recurring' ? 'Cuota:' : 'Total:'}</span>
                      <span style={{ color: '#38BDF8' }}>
                        ${Math.round(q.total || 0).toLocaleString()} {q.currency}
                        {q.proposalType === 'recurring' && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)' }}> / {(q.billingCycleLabel || 'mes').toLowerCase()}</span>}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.9rem' }}>
                  
                  {/* Botón Principal: Ver / Descargar PDF */}
                  <button
                    onClick={() => handleOpenPreview(q)}
                    className="btn btn--accent"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      fontWeight: 700
                    }}
                  >
                    <FiDownload /> Ver & Descargar PDF
                  </button>

                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'space-between' }}>
                    <button
                      onClick={() => onGenerateContract && onGenerateContract(q)}
                      className="btn btn--ghost"
                      style={{ flex: 1.2, padding: '0.4rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      title="Generar contrato legal"
                    >
                      📜 Contrato
                    </button>

                    <button
                      onClick={() => copyWhatsAppSummary(q)}
                      className="btn btn--ghost"
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      title="Copiar para WhatsApp"
                    >
                      {copiedId === q.id ? <FiCheck color="#4ADE80" /> : <FiSend />} WhatsApp
                    </button>

                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="btn btn--ghost"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                      title="Editar"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      onClick={() => handleDelete(q.id)}
                      className="btn btn--ghost"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: '#f87171' }}
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
