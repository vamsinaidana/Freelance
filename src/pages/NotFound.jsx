
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="page-container text-center">
      <h1
        style={{
          fontSize: "100px",
          fontWeight: "800",
          color: "#2563EB",
        }}
      >
        404
      </h1>

      <h2 className="section-title">Page Not Found</h2>

      <p className="text-secondary mt-3">
        Sorry, the page you are looking for does not exist.
      </p>

      <Link to="/" className="btn btn-primary mt-3 px-4">
        Back to Dashboard
      </Link>
    </main>
  );
}

export default NotFound;
