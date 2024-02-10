import { fetchUser } from "#/api/auth.http";
import { QueryConstants } from "#/api/queryConstants";
import { Role, User, isInRole } from "#/api/types";
import { cn } from "#/utils/css";
import { QueryClient } from "@tanstack/react-query";
import { NavLinkProps, Outlet, useLoaderData } from "react-router-dom";
import { NavLink, LoaderFunction, redirect } from "react-router-dom";

export function dashboardLoader(
  queryClient: QueryClient
): LoaderFunction<User> {
  return async () => {
    try {
      const value = await queryClient.fetchQuery({
        queryKey: QueryConstants.USER,
        queryFn: fetchUser,
      });

      if (isInRole(value, [Role.ADMIN, Role.SUPERADMIN])) {
        return value;
      }
    } catch (_) {
      /* empty */
    }
    return redirect("/");
  };
}

function DashboardHeader(): JSX.Element {
  const classNames: NavLinkProps["className"] = ({ isActive }) =>
    cn("tab", { "tab-active": isActive });

  return (
    <header className="p-4 py-8">
      <div
        role="tablist"
        className="tabs tabs-boxed mx-auto w-full md:max-w-md"
      >
        <NavLink role="tab" end className={classNames} to="/dashboard">
          General
        </NavLink>
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
