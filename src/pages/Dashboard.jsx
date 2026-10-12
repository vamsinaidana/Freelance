
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Profile from "../components/Profile";
import StatCard from "../components/StatCard";
import ProjectForm from "../components/ProjectForm";
import { supabase } from "../lib/supabase";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function fetchProjects() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProjects(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  const completedProjects = projects.filter(
    (project) => project.status === "completed"
  ).length;

  const totalEarnings = projects
    .filter((project) => project.status === "completed")
    .reduce((total, project) => total + Number(project.amount || 0), 0);

  function handleProjectAdded(newProject) {
    setProjects((prev) => [newProject, ...prev]);
    setShowForm(false);
  }

  return (
    <main className="page-container">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <p className="text-primary fw-semibold mb-2">YOUR WORKSPACE</p>
          <h1 className="section-title">Dashboard</h1>
          <p className="text-secondary">
            Manage your freelance portfolio and projects.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Close Form" : "+ Add Project"}
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <ProjectForm onProjectAdded={handleProjectAdded} />
        </div>
      )}

      <Profile />

      <div className="row g-3 mt-3">
        <div className="col-12 col-md-4">
          <StatCard title="Total Projects" value={projects.length} />
        </div>

        <div className="col-12 col-md-4">
          <StatCard
            title="Completed Projects"
            value={completedProjects}
          />
        </div>

        <div className="col-12 col-md-4">
          <StatCard
            title="Total Earnings"
            value={`₹${totalEarnings.toLocaleString("en-IN")}`}
          />
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
        <h2 className="h4 fw-bold mb-0">Recent Projects</h2>
        <Link to="/projects" className="btn btn-outline-primary">
          View All
        </Link>
      </div>

      {loading && <p>Loading projects...</p>}

      {error && (
        <div className="alert alert-danger">
          Failed to load projects: {error}
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <p>No projects found. Click Add Project to create your first project.</p>
      )}

      <div className="row g-3">
        {projects.slice(0, 3).map((project) => (
          <div className="col-12 col-md-6 col-lg-4" key={project.id}>
            <div className="dashboard-card h-100">
              {project.image_url && (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="project-image mb-3"
                />
              )}

              <h3 className="h5 blue fw-bold">{project.title}</h3>
              <p className="text-secondary">{project.description}</p>

              <div className="d-flex justify-content-between align-items-center gap-2">
                <span style={{color:"green"}} className="badge text-bg-light border">
                  {project.status}
                </span>

                <strong>
                  ₹{Number(project.amount || 0).toLocaleString("en-IN")}
                </strong>
              </div>

              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary btn-sm mt-3 me-2"
                >
                  Live Project
                </a>
              )}

              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-secondary btn-sm mt-3"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Dashboard;
