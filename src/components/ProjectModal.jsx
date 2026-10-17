function ProjectModal({ project, onClose }) {
  if (!project) return null;

  const amount = Number(project.amount ?? project.price ?? 0);
  const technologies = project.technologies || project.skills || [];
  const rating = Math.min(5, Math.max(0, Number(project.rating) || 0));

  const image =
    project.image || project.image_url || "https://placehold.co/600x350?text=Project";

  const status = project.status || "Not specified";
  const paymentStatus =
    project.payment_status || project.paymentStatus || "Not specified";

  const duration = project.duration || "Not specified";
  const liveUrl = project.liveUrl || project.project_url;
  const githubUrl = project.githubUrl || project.github_url;

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
            <h2 className="modal-title h5 fw-bold">
              {project.title}
            </h2>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div className="modal-body p-4">
            <img
              src={image}
              alt={project.title || "Project"}
              className="project-image mb-4"
            />

            <p className="text-secondary">
              {project.description || "No description provided"}
            </p>

            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="p-3 rounded-3 border h-100">
                  <small className="text-secondary">Project Charge</small>
                  <h5 className="fw-bold mt-2 mb-0">
                    ₹{amount.toLocaleString("en-IN")}
                  </h5>
                </div>
              </div>

              <div className="col-6">
                <div className="p-3 rounded-3 border h-100">
                  <small className="text-secondary">Duration</small>
                  <h5 className="fw-bold mt-2 mb-0">{duration}</h5>
                </div>
              </div>

              <div className="col-6">
                <div className="p-3 rounded-3 border h-100">
                  <small className="text-secondary">Project Status</small>
                  <h5 className="fw-bold mt-2 mb-0 text-capitalize">
                    {status}
                  </h5>
                </div>
              </div>

           <div className="col-6">
  <div className="p-3 rounded-3 border h-100">
    <small className="text-secondary">Payment Status</small>
    <h5 className="fw-bold mt-2 mb-0 text-capitalize">
      {paymentStatus}
    </h5>
  </div>
</div>
            </div>

 
            <div className="d-flex flex-wrap gap-2 mb-4">
              {technologies.map((technology, index) => (
                <span
                  className="badge text-bg-light border"
                  key={`${technology}-${index}`}
                >
                  {technology}
                </span>
              ))}
            </div>

            <h6 className="fw-bold">Rating</h6>

            <p className="text-warning fs-5">
              {"★".repeat(rating)}
              <span className="text-secondary">
                {"★".repeat(5 - rating)}
              </span>
            </p>

            {project.completionDate && (
              <p>
                <strong>Completion Date:</strong>{" "}
                {project.completionDate}
              </p>
            )}
          </div>

          <div className="modal-footer">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                Live Project
              </a>
            )}

            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-dark"
              >
                GitHub Repository
              </a>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;