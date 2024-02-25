import { useUser } from "#/api/auth.queries";
import { Role, User, isInRole } from "#/api/types";
import { LayoutDashboardIcon, LogOutIcon, LucideLogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "../form/Input";
import { searchRoom } from "#/api/navbar.http";
import { QueryConstants } from "#/api/queryConstants";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

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
            alt="User Avatar"
            src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
          />
        </div>
      </div>
      <ul className="mt-3 z-[1] p-2 gap-1 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
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
  const [search, setSearch] = useState<string>("");

  const { data } = useQuery({
    queryKey: [...QueryConstants.SEARCH_ROOM, search],
    maxPages: 60, // Data live 60 seconds
    queryFn: async () => {
      try {
        return await searchRoom(search);
      } catch (error) {
        return null;
      }
    },
  });

  return (
    <nav className="navbar bg-base-100 border-b border-base-200">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          <img
            src="/assets/logo.png"
            alt="Wasoot logo"
            className="w-14 h-14 -my-2"
          />
          <span>Wasoot</span>
        </Link>
      </div>
      <div className="flex-1 gap-2 justify-end">
        <div className="relative">
          <div className="form-control">
            <Input
              type="text"
              placeholder="Search"
              className="w-auto max-w-none"
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {data && data.rooms.length > 0 && (
            <ul className="z-[1] menu p-2 shadow bg-base-100 rounded-box w-full absolute mt-2">
              {data.rooms.map((room) => (
                <li key={room.id}>
                  <Link to={`/quiz/session/${room.id}`}>{room.name}</Link>
                </li>
              ))}
            </ul>
          )}
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
