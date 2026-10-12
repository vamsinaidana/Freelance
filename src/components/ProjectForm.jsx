
import { useState } from "react";
import { supabase } from "../lib/supabase";

const initialFormData = {
  title: "",
  description: "",
  image_url: "",
  project_url: "",
  github_url: "",
  rating: 5,
  duration: "",
  amount: "",
  status: "completed",
};

function ProjectForm({ onProjectAdded }) {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // 1. Check the current Supabase session
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const session = sessionData.session;

      if (!session?.user) {
        throw new Error(
          "Login session missing. Please open Admin Login and sign in again."
        );
      }

      console.log("Active session:", true);
      console.log("Logged-in user ID:", session.user.id);

      // 2. Prepare project data
      const projectData = {
        title: formData.title.trim(),
        description:
          formData.description.trim() || "No description provided",
        image_url: formData.image_url.trim(),
        project_url: formData.project_url.trim(),
        github_url: formData.github_url.trim(),
        rating: Number(formData.rating),
        duration: formData.duration.trim() || "Not specified",
        amount: Number(formData.amount || 0),
        status: formData.status,
      };

      if (!projectData.title) {
        throw new Error("Please enter a project title.");
      }

      console.log("Saving project:", projectData.title);

      // 3. Insert into Supabase
      const {
        data: savedProject,
        error: insertError,
      } = await supabase
        .from("projects")
        .insert(projectData)
        .select()
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw insertError;
      }

      // 4. Success
      console.log("Project saved:", savedProject);
      setMessage("Project saved successfully!");
      setFormData({ ...initialFormData });

      if (onProjectAdded) {
        onProjectAdded(savedProject);
      }
    } catch (err) {
      console.error("Save project failed:", err);
      setError(err.message || "Failed to save project.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-card">
      <h2 className="h4 section-title mb-4">Add New Project</h2>

      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="project-title">
            Project Title *
          </label>
          <input
            id="project-title"
            className="form-control"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="project-description">
            Description
          </label>
          <textarea
            id="project-description"
            className="form-control"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="project-image">
            Project Image URL
          </label>
          <input
            id="project-image"
            type="url"
            className="form-control"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.png"
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="project-url">
            Live Project URL
          </label>
          <input
            id="project-url"
            type="url"
            className="form-control"
            name="project_url"
            value={formData.project_url}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="github-url">
            GitHub URL
          </label>
          <input
            id="github-url"
            type="url"
            className="form-control"
            name="github_url"
            value={formData.github_url}
            onChange={handleChange}
            placeholder="https://github.com/username/repo"
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="project-rating">
              Rating
            </label>
            <select
              id="project-rating"
              className="form-select"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} Star{rating > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="project-duration">
              Duration
            </label>
            <input
              id="project-duration"
              className="form-control"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 2 weeks"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="project-amount">
            Project Charge (₹)
          </label>
          <input
            id="project-amount"
            type="number"
            min="0"
            step="0.01"
            className="form-control"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label className="form-label" htmlFor="project-status">
            Status
          </label>
          <select
            id="project-status"
            className="form-select"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Saving Project..." : "Save Project"}
        </button>
      </form>
    </div>
  );
}

export default ProjectForm;
