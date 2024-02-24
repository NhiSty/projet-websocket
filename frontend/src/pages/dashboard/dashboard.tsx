import { cn } from "#/utils/css";
import { NavLinkProps, Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";

function DashboardHeader(): JSX.Element {
  const classNames: NavLinkProps["className"] = ({ isActive }) =>
    cn("tab", { "tab-active": isActive });

  return (
    <header className="p-4 py-8">
      <div
        role="tablist"
        className="tabs tabs-boxed mx-auto w-full md:max-w-md"
      >
        <NavLink role="tab" className={classNames} to="/dashboard/quizzes">
          Quizzes
        </NavLink>
        <NavLink role="tab" className={classNames} to="/dashboard/users">
          Users
        </NavLink>
      </div>
    </header>
  );
}

export function Dashboard(): JSX.Element {
  return (
    <div className="flex flex-col">
      <DashboardHeader />

      <main className="px-4 py-12 md:p-12">
        <Outlet />
      </main>
    </div>
  );
}
