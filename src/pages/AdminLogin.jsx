
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // 1. Login with Supabase
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw loginError;
      }

      // 2. Check login response
      console.log("Login session:", !!data.session);
      console.log("Login user:", data.user?.id);

      if (!data.session || !data.user) {
        throw new Error(
          "Login succeeded but session is missing. Please try again."
        );
      }

      // 3. Verify the stored session
      const {
        data: sessionCheck,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      console.log("Stored session:", !!sessionCheck.session);

      if (!sessionCheck.session) {
        throw new Error(
          "Session was not stored. Please try logging in again."
        );
      }

      // 4. Verify the current user
      const {
        data: userCheck,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      console.log("Verified user:", userCheck.user?.id);

      // 5. Navigate after successful verification
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Admin login failed:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-container">
      <div
        className="dashboard-card mx-auto"
        style={{ maxWidth: "450px" }}
      >
        <h1 className="h3 section-title mb-2">
          Admin Login
        </h1>

        <p className="text-secondary mb-4">
          Sign in to manage your projects.
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label" htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Checking session..." : "Sign In"}
          </button>
        </form>

        <Link to="/" className="d-block text-center mt-3">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}

export default AdminLogin;
