export default function SortHeader({ label, column, sortConfig, onSort }) {
  const active = sortConfig.key === column;
  const direction = active ? sortConfig.direction : "desc";

  return (
    <button type="button" className={`sort-header ${active ? "active" : ""}`} onClick={() => onSort(column)}>
      <span>{label}</span>
      <span>{direction === "asc" ? "↑" : "↓"}</span>
    </button>
  );
}
