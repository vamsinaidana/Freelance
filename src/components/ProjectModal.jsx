
function ProjectModal({ project, onClose }) {
  if (!project) return null;

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 rounded-4 overflow-hidden">
          <div className="modal-header">
            <h2 className="modal-title h5 fw-bold">{project.title}</h2>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div className="modal-body p-4">
            <img
              src={project.image}
              alt={project.title}
              className="project-image mb-4"
            />

            <p className="text-secondary">{project.description}</p>

            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="p-3 rounded-3 border">
                  <small className="text-secondary">Project Charge</small>
                  <h5 className="fw-bold mt-2 mb-0">
                    ₹{project.price.toLocaleString("en-IN")}
                  </h5>
                </div>
              </div>

              <div className="col-6">
                <div className="p-3 rounded-3 border">
                  <small className="text-secondary">Duration</small>
                  <h5 className="fw-bold mt-2 mb-0">{project.duration}</h5>
                </div>
              </div>

              <div className="col-6">
                <div className="p-3 rounded-3 border">
                  <small className="text-secondary">Project Status</small>
                  <h5 className="fw-bold mt-2 mb-0">{project.status}</h5>
                </div>
              </div>

              <div className="col-6">
                <div className="p-3 rounded-3 border">
                  <small className="text-secondary">Payment Status</small>
                  <h5 className="fw-bold mt-2 mb-0">
                    {project.paymentStatus}
                  </h5>
                </div>
              </div>
            </div>

            <h6 className="fw-bold">Technologies</h6>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {project.technologies.map((technology) => (
                <span className="badge text-bg-light border" key={technology}>
                  {technology}
                </span>
              ))}
            </div>

            <h6 className="fw-bold">Rating</h6>
            <p className="text-warning fs-5">
              {"★".repeat(project.rating)}
              <span className="text-secondary">
                {"★".repeat(5 - project.rating)}
              </span>
            </p>

            {project.completionDate && (
              <p>
                <strong>Completion Date:</strong> {project.completionDate}
              </p>
            )}
          </div>

          <div className="modal-footer">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                Live Project
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-dark"
              >
                GitHub Repository
              </a>
            )}

            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;
