import React from 'react'

const Footer = () => {
  return (
    <div>
      <footer className="site-footer">
      <div className="footer-line"></div>

      <div className="footer-content">
        <p className="footer-copyright">
          © {new Date().getFullYear()} Freelancing.V. All rights reserved.
        </p>

        <p className="footer-credit">
          Designed and developed by{" "}
          <span className="footer-name">Vamsi Naidana</span>
        </p>

        <p className="footer-distribution">
          Distributed by{" "}
          <a
            href="https://vgwd.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            VGWD
          </a>
        </p>
      </div>
    </footer>
    </div>
  )
}

export default Footer
