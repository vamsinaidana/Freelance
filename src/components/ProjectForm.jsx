
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const BUCKET_NAME = "freelancing-project-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    setError("");
    setMessage("");

    if (!file) {
      setSelectedImage(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      setSelectedImage(null);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image size must be 5 MB or less.");
      setSelectedImage(null);
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    let uploadedFilePath = null;

    try {
      // 1. Check login session
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const session = sessionData.session;

      if (!session?.user) {
        throw new Error(
          "Login session missing. Please sign in again."
        );
      }

      if (!formData.title.trim()) {
        throw new Error("Please enter a project title.");
      }

      // 2. Upload selected image to Supabase Storage
      let imageUrl = "";

      if (selectedImage) {
        const safeFileName = selectedImage.name
          .replace(/[^a-zA-Z0-9._-]/g, "_")
          .slice(-100);

        uploadedFilePath =
          `${session.user.id}/${Date.now()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(uploadedFilePath, selectedImage, {
            cacheControl: "3600",
            contentType: selectedImage.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(uploadedFilePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // 3. Prepare database data
      const projectData = {
        title: formData.title.trim(),
        description:
          formData.description.trim() || "No description provided",
        image_url: imageUrl,
        project_url: formData.project_url.trim(),
        github_url: formData.github_url.trim(),
        rating: Number(formData.rating),
        duration: formData.duration.trim() || "Not specified",
        amount: Number(formData.amount || 0),
        status: formData.status,
      };

      // 4. Save project in Supabase database
      const {
        data: savedProject,
        error: insertError,
      } = await supabase
        .from("projects")
        .insert(projectData)
        .select()
        .single();

      if (insertError) throw insertError;

      // 5. Success
      setMessage("Project and image saved successfully!");
      setFormData({ ...initialFormData });
      setSelectedImage(null);
      setFileInputKey((prev) => prev + 1);

      if (onProjectAdded) {
        onProjectAdded(savedProject);
      }
    } catch (err) {
      console.error("Save project failed:", err);

      // Remove the uploaded image if saving the project failed
      if (uploadedFilePath) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([uploadedFilePath]);

        if (cleanupError) {
          console.error("Image cleanup failed:", cleanupError);
        }
      }

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
            Project Image
          </label>

          <input
            key={fileInputKey}
            id="project-image"
            type="file"
            className="form-control"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />

          <div className="form-text">
            JPG, PNG or WEBP. Maximum file size: 5 MB.
          </div>

          {previewUrl && (
            <div className="mt-3">
              <img
                src={previewUrl}
                alt="Selected project preview"
                style={{
                  width: "100%",
                  maxWidth: "320px",
                  height: "190px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  border: "1px solid #dee2e6",
                }}
              />

              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => {
                    setSelectedImage(null);
                    setError("");
                  }}
                  disabled={loading}
                >
                  Remove Image
                </button>
              </div>
            </div>
          )}
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
          {loading
            ? "Uploading Image & Saving..."
            : "Save Project"}
        </button>
      </form>
    </div>
  );
}

export default ProjectForm;
