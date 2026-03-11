export default function Footer() {
  const year = new Date().getFullYear()

  const socialLinks = [
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/gadiel-palma-ramos-08375817b/',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.94 8.5v8.56H4.09V8.5h2.85Zm.19-2.65a1.65 1.65 0 1 1-3.3 0 1.65 1.65 0 0 1 3.3 0ZM20.17 12.16v4.9h-2.84v-4.57c0-1.15-.41-1.93-1.43-1.93-.78 0-1.24.52-1.44 1.03-.08.18-.1.43-.1.68v4.79h-2.85V8.5h2.85v1.22c.38-.58 1.05-1.4 2.56-1.4 1.87 0 3.25 1.22 3.25 3.84Z" />
        </svg>
      )
    },
    {
      name: 'GitHub',
      href: 'https://github.com/Gad07',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.2-3.37-1.2-.45-1.16-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.52 1.03 1.52 1.03.88 1.5 2.3 1.07 2.87.82.09-.64.35-1.07.63-1.32-2.22-.25-4.56-1.1-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.28.1-2.67 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.8c.85 0 1.7.11 2.5.33 1.9-1.3 2.74-1.03 2.74-1.03.56 1.39.21 2.42.1 2.67.64.7 1.03 1.59 1.03 2.68 0 3.86-2.35 4.69-4.58 4.93.36.32.68.94.68 1.9v2.83c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
        </svg>
      )
    }
  ]

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__copy"> © {year} Gadiel Palma Ramos. Todos los derechos reservados.</p>

        <div className="footer__socials" aria-label="Redes sociales">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              className="footer__social-link"
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.name}
              title={social.name}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
