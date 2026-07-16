export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer-premium">
      <div className="footer-premium__inner">
        <div className="footer-premium__line" />
        <div className="footer-premium__content">
          <span className="footer-premium__copy">
            © {year} GADIEL PALMA
          </span>
          <span className="footer-premium__dot">•</span>
          <span className="footer-premium__tag">CREATIVE DEVELOPER</span>
        </div>
      </div>
    </footer>
  )
}

