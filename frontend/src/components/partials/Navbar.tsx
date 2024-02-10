import { useUser } from "#/api/auth.queries";
import { Role, User, isInRole } from "#/api/types";
import logo from "#/assets/logo.png";
import {
  LayoutDashboardIcon,
  LogOutIcon,
  LucideLogIn,
  Settings2Icon,
} from "lucide-react";
import { Link } from "react-router-dom";

interface NavbarUserSectionProps {
  user: User;
}

function NavbarUserSection({ user }: NavbarUserSectionProps): JSX.Element {
  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar"
      >
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS Navbar component"
            src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
          />
        </div>
      </div>
      <ul
        tabIndex={0}
        className="mt-3 z-[1] p-2 gap-1 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
      >
        {isInRole(user, [Role.ADMIN, Role.SUPERADMIN]) && (
          <li>
            <Link to="/dashboard">
              <LayoutDashboardIcon className="w-6 h-6" />
              Dashboard
            </Link>
          </li>
        )}
        <li>
          <Link to="/logout">
            <LogOutIcon className="w-6 h-6" />
            Logout
          </Link>
        </li>
      </ul>
    </div>
  );
}

export function Navbar(): JSX.Element {
  const { data: user } = useUser();

  return (
    <nav className="navbar bg-base-100 border-b border-base-200">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          <img src={logo} alt="Wasoot logo" className="w-14 h-14 -my-2" />
          <span>Wasoot</span>
        </Link>
      </div>
      <div className="flex-1 gap-2 justify-end">
        <div className="form-control">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-auto"
          />
        </div>
        {user ? (
          <NavbarUserSection user={user} />
        ) : (
          <Link
            className="btn btn-ghost"
            to="/login"
            aria-label="Authenticate user"
          >
            <LucideLogIn />
          </Link>
        )}
      </div>
    </nav>
  );
}
