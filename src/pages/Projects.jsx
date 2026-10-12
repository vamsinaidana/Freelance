
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";

const emptyEditForm = {
  title: "",
  description: "",
  image_url: "",
  project_url: "",
  github_url: "",
  rating: 5,
  duration: "",
  amount: 0,
  status: "completed",
};

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function fetchProjects() {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setProjects(data || []);
    } catch (err) {
      console.error("Fetch projects error:", err);
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  function handleEdit(project) {
    setActionError("");
    setMessage("");
    setSelectedProject(null);
    setEditingProject(project);

    setEditForm({
      title: project.title || "",
      description: project.description || "",
      image_url: project.image_url || project.image || "",
      project_url: project.project_url || project.liveUrl || "",
      github_url: project.github_url || project.githubUrl || "",
      rating: Number(project.rating) || 5,
      duration: project.duration || "",
      amount: Number(project.amount ?? project.price ?? 0),
      status: project.status || "draft",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleUpdate(event) {
    event.preventDefault();

    if (saving || !editingProject) return;

    setSaving(true);
    setActionError("");
    setMessage("");

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData.session?.user) {
        throw new Error(
          "Login session missing. Please sign in through Admin Login first."
        );
      }

      if (!editingProject.id) {
        throw new Error("Project ID is missing.");
      }

      const updatedData = {
        title: editForm.title.trim(),
        description:
          editForm.description.trim() || "No description provided",
        image_url: editForm.image_url.trim(),
        project_url: editForm.project_url.trim(),
        github_url: editForm.github_url.trim(),
        rating: Number(editForm.rating),
        duration: editForm.duration.trim() || "Not specified",
        amount: Number(editForm.amount || 0),
        status: editForm.status,
      };

      if (!updatedData.title) {
        throw new Error("Please enter a project title.");
      }

      console.log("Updating project ID:", editingProject.id);

      // .single() removed to prevent the single-object coercion error.
      const { data: updatedRows, error: updateError } = await supabase
        .from("projects")
        .update(updatedData)
        .eq("id", editingProject.id)
        .select();

      if (updateError) throw updateError;

      if (!updatedRows || updatedRows.length === 0) {
        throw new Error(
          "No project was updated. Check your Supabase UPDATE RLS policy and project ID."
        );
      }

      const updatedProject = updatedRows[0];

      setProjects((previous) =>
        previous.map((project) =>
          project.id === updatedProject.id ? updatedProject : project
        )
      );

      setEditingProject(null);
      setEditForm({ ...emptyEditForm });
      setMessage("Project updated successfully!");

      console.log("Project updated successfully:", updatedProject);
    } catch (err) {
      console.error("Update project failed:", err);
      setActionError(err.message || "Failed to update project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project) {
    if (deletingId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(project.id);
    setActionError("");
    setMessage("");

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData.session?.user) {
        throw new Error(
          "Login session missing. Please sign in through Admin Login first."
        );
      }

      const { data: deletedRows, error: deleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id)
        .select("id");

      if (deleteError) throw deleteError;

      if (!deletedRows || deletedRows.length === 0) {
        throw new Error(
          "Project was not deleted. Check your Supabase DELETE RLS policy and project ID."
        );
      }

      setProjects((previous) =>
        previous.filter((item) => item.id !== project.id)
      );

      if (selectedProject?.id === project.id) {
        setSelectedProject(null);
      }

      if (editingProject?.id === project.id) {
        setEditingProject(null);
        setEditForm({ ...emptyEditForm });
      }

      setMessage("Project deleted successfully!");
      console.log("Project deleted:", project.id);
    } catch (err) {
      console.error("Delete project failed:", err);
      setActionError(err.message || "Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProjects = projects.filter((project) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      (project.title || "").toLowerCase().includes(query) ||
      (project.description || "").toLowerCase().includes(query) ||
      (Array.isArray(project.skills) ? project.skills : []).some((skill) =>
        String(skill).toLowerCase().includes(query)
      );

    const matchesStatus =
      status === "All" ||
      String(project.status || "").toLowerCase() === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="page-container">
      <div className="mb-4">
        <p className="text-primary fw-semibold mb-2">MY WORK</p>
        <h1 className="section-title">Projects</h1>
        <p className="text-secondary">
          Explore my freelance and development projects.
        </p>
      </div>

      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}

      {actionError && (
        <div className="alert alert-danger" role="alert">
          {actionError}
        </div>
      )}

      {editingProject && (
        <div className="dashboard-card mb-4" id="edit-project-form">
          <h2 className="h4 section-title mb-4">Edit Project</h2>

          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label" htmlFor="edit-title">
                Project Title *
              </label>
              <input
                id="edit-title"
                className="form-control"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="edit-description">
                Description
              </label>
              <textarea
                id="edit-description"
                className="form-control"
                name="description"
                rows={3}
                value={editForm.description}
                onChange={handleEditChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="edit-image">
                Image URL
              </label>
              <input
                id="edit-image"
                type="url"
                className="form-control"
                name="image_url"
                value={editForm.image_url}
                onChange={handleEditChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="edit-live-url">
                Live Project URL
              </label>
              <input
                id="edit-live-url"
                type="url"
                className="form-control"
                name="project_url"
                value={editForm.project_url}
                onChange={handleEditChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="edit-github-url">
                GitHub URL
              </label>
              <input
                id="edit-github-url"
                type="url"
                className="form-control"
                name="github_url"
                value={editForm.github_url}
                onChange={handleEditChange}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="edit-rating">
                  Rating
                </label>
                <select
                  id="edit-rating"
                  className="form-select"
                  name="rating"
                  value={editForm.rating}
                  onChange={handleEditChange}
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} Star{rating > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="edit-duration">
                  Duration
                </label>
                <input
                  id="edit-duration"
                  className="form-control"
                  name="duration"
                  value={editForm.duration}
                  onChange={handleEditChange}
                  placeholder="e.g. 2 weeks"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="edit-amount">
                Project Charge (₹)
              </label>
              <input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                name="amount"
                value={editForm.amount}
                onChange={handleEditChange}
              />
            </div>

            <div className="mb-4">
              <label className="form-label" htmlFor="edit-status">
                Status
              </label>
              <select
                id="edit-status"
                className="form-select"
                name="status"
                value={editForm.status}
                onChange={handleEditChange}
              >
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Updating..." : "Update Project"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={saving}
                onClick={() => {
                  setEditingProject(null);
                  setEditForm({ ...emptyEditForm });
                  setActionError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Search projects or technologies..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="col-12 col-md-4">
          <select
            className="form-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading && <p>Loading projects...</p>}

      {error && (
        <div className="alert alert-danger">
          Failed to load projects: {error}
          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={fetchProjects}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filteredProjects.length === 0 && (
        <p className="text-secondary">
          No projects found. Check your Supabase projects table.
        </p>
      )}

      <div className="row g-3">
        {filteredProjects.map((project) => (
          <div className="col-12 col-md-6 col-lg-4" key={project.id}>
            <ProjectCard
              project={{
                ...project,
                image: project.image_url,
                amount: project.amount ?? project.price ?? 0,
                paymentStatus: project.payment_status,
                completionDate: project.completed_at,
                liveUrl: project.project_url,
                githubUrl: project.github_url,
                technologies: project.skills || [],
              }}
              onView={() => setSelectedProject(project)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {deletingId === project.id && (
              <p className="small text-secondary mt-2">
                Deleting project...
              </p>
            )}
          </div>
        ))}
      </div>

      {selectedProject && (
        <ProjectModal
          project={{
            ...selectedProject,
            image: selectedProject.image_url,
            amount: selectedProject.amount ?? selectedProject.price ?? 0,
            paymentStatus: selectedProject.payment_status,
            completionDate: selectedProject.completed_at,
            liveUrl: selectedProject.project_url,
            githubUrl: selectedProject.github_url,
            technologies: selectedProject.skills || [],
          }}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </main>
  );
}

export default Projects;
