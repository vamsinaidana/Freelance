
function ProjectCard({ project, onView, onEdit, onDelete }) {
  const technologies = project.technologies || project.skills || [];
  const amount = Number(project.amount ?? project.price ?? 0);
  const rating = Math.min(5, Math.max(0, Number(project.rating) || 0));

  const status = String(project.status || "draft").toLowerCase();

  const statusLabels = {
    completed: "Completed",
    "in-progress": "In Progress",
    draft: "Draft",
  };

  const statusClasses = {
    completed: "text-bg-success",
    "in-progress": "text-bg-warning",
    draft: "text-bg-secondary",
  };

  return (
    <div className="dashboard-card h-100">
      <img
        src={
          project.image ||
          project.image_url ||
          "https://placehold.co/600x350?text=Project"
        }
        alt={project.title || "Project"}
        className="project-image mb-3"
      />

      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
        <h3 className="h5 fw-bold mb-0">{project.title}</h3>

        <span className={`badge ${statusClasses[status] || "text-bg-secondary"}`}>
          {statusLabels[status] || project.status}
        </span>
      </div>

      <p className="text-secondary">
        {project.description || "No description provided"}
      </p>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {technologies.map((technology, index) => (
          <span
            className="badge text-bg-light border"
            key={`${technology}-${index}`}
          >
            {technology}
          </span>
        ))}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-warning">
          {"★".repeat(rating)}
          <span className="text-secondary">
            {"★".repeat(5 - rating)}
          </span>
        </span>

        <strong>₹{amount.toLocaleString("en-IN")}</strong>
      </div>

      <p className="small text-secondary">
        Duration: {project.duration || "Not specified"}
      </p>

      <div className="d-flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary flex-grow-1"
          onClick={() => onView?.(project)}
        >
          View Details
        </button>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => onEdit?.(project)}
        >
          <i className="bi bi-pencil-square me-1"></i>
          Edit
        </button>

        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={() => onDelete?.(project)}
        >
          <i className="bi bi-trash me-1"></i>
          Delete
        </button>
      </div>
    </div>
  );
}

export default ProjectCard;
