import { Navbar } from "#/components/partials/Navbar";
import { Outlet } from "react-router-dom";

export function BaseLayout(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
}
