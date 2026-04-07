export default function DetailDrawer({ selected, onClose }) {
  if (!selected) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer-panel" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <span className="micro-label">{selected.kind}</span>
            <h2>{selected.title}</h2>
          </div>
          <button className="drawer-close" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="drawer-body">
          <div className="drawer-section">
            <span className="micro-label">Leitura rapida</span>
            <div className="drawer-kpis">
              {selected.kpis.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {selected.notes?.length ? (
            <div className="drawer-section">
              <span className="micro-label">Destaques</span>
              <ul className="drawer-list">
                {selected.notes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
