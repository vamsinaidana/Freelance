
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";

const BUCKET_NAME = "freelancing-project-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

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

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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

  // Open edit form
  function handleEdit(project) {
    setActionError("");
    setMessage("");
    setSelectedProject(null);
    setEditingProject(project);

    setSelectedImage(null);
    setImagePreview(project.image_url || project.image || "");

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

  // Handle text fields
  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Select and preview a new image
  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setActionError("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setActionError("Image size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    setActionError("");
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  // Cancel editing
  function handleCancelEdit() {
    setEditingProject(null);
    setEditForm({ ...emptyEditForm });
    setSelectedImage(null);
    setImagePreview("");
    setActionError("");
  }

  // Upload selected image and update project
  async function handleUpdate(event) {
    event.preventDefault();

    if (saving || !editingProject) return;

    setSaving(true);
    setActionError("");
    setMessage("");

    let uploadedFilePath = null;

    try {
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const session = sessionData.session;

      if (!session?.user) {
        throw new Error(
          "Login session missing. Please sign in through Admin Login first."
        );
      }

      if (!editingProject.id) {
        throw new Error("Project ID is missing.");
      }

      const title = editForm.title.trim();

      if (!title) {
        throw new Error("Please enter a project title.");
      }

      let newImageUrl = editForm.image_url.trim();

      // Upload only if a new image was selected.
      // Otherwise, preserve the current image URL.
      if (selectedImage) {
        const safeFileName = selectedImage.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "-"
        );

        uploadedFilePath =
          `${session.user.id}/${Date.now()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(uploadedFilePath, selectedImage, {
            cacheControl: "3600",
            contentType: selectedImage.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Image upload failed: ${uploadError.message}`
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(uploadedFilePath);

        newImageUrl = publicUrlData.publicUrl;
      }

      const updatedData = {
        title,
        description:
          editForm.description.trim() || "No description provided",
        image_url: newImageUrl,
        project_url: editForm.project_url.trim(),
        github_url: editForm.github_url.trim(),
        rating: Number(editForm.rating),
        duration: editForm.duration.trim() || "Not specified",
        amount: Number(editForm.amount || 0),
        status: editForm.status,
      };

      console.log("Updating project:", editingProject.id);

      const {
        data: updatedRows,
        error: updateError,
      } = await supabase
        .from("projects")
        .update(updatedData)
        .eq("id", editingProject.id)
        .select();

      if (updateError) throw updateError;

      if (!updatedRows || updatedRows.length === 0) {
        throw new Error(
          "No project was updated. Check the Supabase UPDATE policy and project ID."
        );
      }

      const updatedProject = updatedRows[0];

      setProjects((previous) =>
        previous.map((project) =>
          project.id === updatedProject.id
            ? updatedProject
            : project
        )
      );

      setEditingProject(null);
      setEditForm({ ...emptyEditForm });
      setSelectedImage(null);
      setImagePreview("");
      setMessage("Project updated successfully!");

      console.log("Project updated successfully:", updatedProject);
    } catch (err) {
      console.error("Update project failed:", err);

      // If upload succeeded but the database update failed,
      // try to remove the newly uploaded image.
      if (uploadedFilePath) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([uploadedFilePath]);

        if (cleanupError) {
          console.error("Image cleanup failed:", cleanupError);
        }
      }

      setActionError(err.message || "Failed to update project.");
    } finally {
      setSaving(false);
    }
  }

  // Delete project
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
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData.session?.user) {
        throw new Error(
          "Login session missing. Please sign in through Admin Login first."
        );
      }

      const {
        data: deletedRows,
        error: deleteError,
      } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id)
        .select("id");

      if (deleteError) throw deleteError;

      if (!deletedRows || deletedRows.length === 0) {
        throw new Error(
          "Project was not deleted. Check your Supabase DELETE policy and project ID."
        );
      }

      setProjects((previous) =>
        previous.filter((item) => item.id !== project.id)
      );

      if (selectedProject?.id === project.id) {
        setSelectedProject(null);
      }

      if (editingProject?.id === project.id) {
        handleCancelEdit();
      }

      setMessage("Project deleted successfully!");
    } catch (err) {
      console.error("Delete project failed:", err);
      setActionError(err.message || "Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  }

  // Search and status filtering
  const filteredProjects = projects.filter((project) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      (project.title || "").toLowerCase().includes(query) ||
      (project.description || "").toLowerCase().includes(query) ||
      (Array.isArray(project.skills) ? project.skills : []).some(
        (skill) => String(skill).toLowerCase().includes(query)
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

      {/* Edit Project Form */}
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

            {/* Image upload instead of URL */}
            <div className="mb-3">
              <label className="form-label" htmlFor="edit-image">
                Project Image
              </label>

              {imagePreview && (
                <div className="mb-3">
                  <img
                    src={imagePreview}
                    alt="Project preview"
                    style={{
                      width: "100%",
                      maxWidth: "320px",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      display: "block",
                    }}
                  />

                  <small className="text-secondary d-block mt-2">
                    {selectedImage
                      ? "New image preview"
                      : "Current image"}
                  </small>
                </div>
              )}

              <input
                id="edit-image"
                type="file"
                className="form-control"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />

              <small className="text-secondary d-block mt-2">
                JPG, PNG, WEBP. Maximum 5 MB. Select a new image
                only if you want to replace the current image.
              </small>
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
                placeholder="https://example.com"
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
                placeholder="https://github.com/username/repo"
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
                {saving ? "Uploading & Updating..." : "Update Project"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={saving}
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and filter */}
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

      {/* Loading and errors */}
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

      {/* Project cards */}
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

      {/* Project details modal */}
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
