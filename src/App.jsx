import BillingDashboard from "./BillingDashboard";
import MetaOpsDashboard from "./MetaOpsDashboard";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const app = params.get("app");

  if (app === "meta") {
    return <MetaOpsDashboard />;
  }

  return <BillingDashboard />;
}
