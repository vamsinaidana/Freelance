
function Profile() {
  return (
    <div className="dashboard-card">
      <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
        <div className="profile-avatar">V</div>

        <div className="flex-grow-1">
          <h2 className="h4 fw-bold mb-1">Vamsi Naidana</h2>
          <p className="text-primary fw-semibold mb-2">
          Web Developer
          </p>
          <p className="text-secondary mb-0">
            I build responsive, user-friendly websites and modern web
            applications 
          </p>
        </div>
      </div>

      <hr />

      <div className="d-flex flex-wrap gap-3">
        <a className="social-link" href="https://github.com/vamsinaidana" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="social-link" href="https://www.linkedin.com/in/vamsinaidana/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a className="social-link" href="https://www.instagram.com/vgwd_2024/" target="_blank" rel="noreferrer">
          Instagram
        </a>
        <a className="social-link" href="https://www.youtube.com/@admin_vamsi" target="_blank" rel="noreferrer">
          YouTube
        </a>
      </div>
    </div>
  );
}

export default Profile;
