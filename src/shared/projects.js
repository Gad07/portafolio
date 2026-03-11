import let1 from '../assets/let-1.svg'
import yukapioca1 from '../assets/yukapioca-1.svg'
import dash1 from '../assets/project1-1.svg'
import notes1 from '../assets/project3-1.svg'

const projects = [
  {
    id: 'p-let-site',
    title: 'Grupo LET',
    description:
      'Sitio corporativo de Link Education and Travel. Proyecto en producción enfocado en captación de leads, presencia institucional y comunicación digital.',
    tech: ['React', 'Laravel', 'Netlify', 'MySQL'],
    repo: '',
    privateSource: true,
    demo: 'https://www.grupo-let.com',
    image: 'https://www.grupo-let.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdlkbjyrtc%2Fimage%2Fupload%2Fv1768589307%2FUntitled_Project_4_rt65zz.jpg&w=828&q=70',
    gallery: [let1],
    year: '2025'
  },
  {
    id: 'p-classscan',
    title: 'ClassScan',
    description:
      'Sistema de gestión de asistencias mediante códigos QR, con exportación de reportes, manejo de justificantes de ausencia y visualización de datos con gráficas interactivas.',
    tech: ['React', 'Node.js', 'QR', 'Charts'],
    repo: 'https://github.com/Gad07/classscan',
    demo: '',
    image: 'https://portafolio-915f5.web.app/img/logo_final.png',
    gallery: [dash1],
    year: '2025'
  },
  {
    id: 'p-armueble',
    title: 'AR Mueble',
    description:
      'Proyecto de realidad aumentada para visualizar muebles en espacios reales desde dispositivos móviles, mejorando la toma de decisiones de decoración.',
    tech: ['AR', 'Mobile', '3D'],
    repo: 'https://github.com/Gad07/ar-mueble',
    demo: '',
    image: 'https://portafolio-915f5.web.app/img/Furniture%20RA-Photoroom.png',
    gallery: [notes1],
    year: '2025'
  },
  {
    id: 'p-assistoria',
    title: 'Assistoria',
    description:
      'Sistema para registrar, gestionar y dar seguimiento a incidencias y solicitudes de soporte técnico, optimizando tiempos de atención y trazabilidad.',
    tech: ['Laravel', 'PHP', 'MySQL'],
    repo: 'https://github.com/Gad07/assistoria',
    demo: '',
    image: 'https://portafolio-915f5.web.app/img/tickets3.png',
    gallery: [yukapioca1],
    year: '2025'
  },
  {
    id: 'p-horarios',
    title: 'Gestión de Horarios de Trabajo y Comida',
    description:
      'Sistema para administración de horarios laborales y tiempos de comida, con enfoque en organización operativa y reducción de conflictos de agenda.',
    tech: ['Python', 'Flask', 'MySQL'],
    repo: 'https://github.com/Gad07/horarios',
    demo: '',
    image: yukapioca1,
    gallery: [yukapioca1],
    year: '2024'
  },
  {
    id: 'p-elearning-let',
    title: 'E-learning Grupo LET',
    description:
      'Plataforma de aprendizaje con seguimiento de progreso, gestión académica y base para certificación digital en entorno institucional.',
    tech: ['Laravel', 'PHP', 'MySQL'],
    repo: 'https://github.com/Gad07/e-learning-grupo-let',
    demo: '',
    image: let1,
    gallery: [let1],
    year: '2025'
  }
]

export default projects
