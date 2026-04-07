export default function TabPanel({ panelKey, activeKey, children }) {
  if (panelKey !== activeKey) return null;

  return (
    <div key={panelKey} className="tab-panel">
      {children}
    </div>
  );
}
