
function StatCard({ title, value }) {
  return (
    <div className="dashboard-card">
      <p className="stat-label mb-3">{title}</p>
      <h3 className="stat-value mb-0">{value}</h3>
    </div>
  );
}

export default StatCard;
