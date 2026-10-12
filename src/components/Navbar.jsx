
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container py-2">
        <Link className="navbar-brand fw-bold fs-4" to="/">
          Freelancing<span className="brand-dot">.V</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <NavLink className="nav-link" to="/">
              Dashboard
            </NavLink>

            <NavLink className="nav-link" to="/projects">
              Projects
            </NavLink>

            <Link className="btn btn-primary px-4 mt-2 mt-lg-0" to="/admin-login">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
