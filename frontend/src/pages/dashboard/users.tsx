import { Button } from "#/components/form/Button";
import { FormController } from "#/components/form/FormController";
import { Input } from "#/components/form/Input";
import {
  Loader2,
  PenIcon,
  SearchIcon,
  Trash2Icon,
  UserPlus2Icon,
} from "lucide-react";
import { useRouteLoaderData } from "react-router-dom";
import { FormEvent, useCallback, useState, type JSX } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QueryConstants } from "#/api/queryConstants";
import { searchAdmins } from "#/api/dashboard.http";
import { Role, User, isInRole } from "#/api/types";
import { DeleteUserModal } from "./users/deleteUserModal";
import { UpdateUserModal } from "./users/updateUserModal";
import { CreateUserModal } from "./users/createUserModal";
import { Pagination } from "#/components/partials/Pagination";

interface UsersHeaderProps {
  onSearch: (search: string) => void;
  onCreate: () => void;
}

function UsersHeader({ onSearch, onCreate }: UsersHeaderProps): JSX.Element {
  const [search, setSearch] = useState<string>("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(search);
  };

  return (
    <header className="relative">
      <form className="flex flex-row gap-2 flex-1 w-full" onSubmit={onSubmit}>
        <FormController
          inputId="adminSearch"
          className="md:max-w-xs max-w-none"
        >
          <Input
            id="adminSearch"
            placeholder="Search"
            className="max-w-none md:max-w-xs"
            onChange={(event) => setSearch(event.target.value)}
          />
        </FormController>
        <Button type="submit" className="btn-primary">
          <SearchIcon className="w-6 h-6" />
          Search
        </Button>

        <Button type="button" className="btn-secondary" onClick={onCreate}>
          <UserPlus2Icon className="w-6 h-6" />
        </Button>
      </form>
    </header>
  );
}

interface UpdateButtonProps {
  user: User;
  onUpdate: () => void;
}

function UpdateButton({
  user,
  onUpdate,
}: UpdateButtonProps): JSX.Element | null {
  return (
    <span className="tooltip tooltip-left" data-tip={`Edit ${user.username}`}>
      <button
        type="button"
        className="btn btn-ghost btn-xs"
        aria-label={`Edit ${user.username}`}
        onClick={() => onUpdate()}
      >
        <PenIcon className="w-4 h-4" />
      </button>
    </span>
  );
}

interface DeleteButtonProps {
  user: User;
  onDelete: () => void;
}

function DeleteButton({
  user,
  onDelete,
}: DeleteButtonProps): JSX.Element | null {
  return (
    <span className="tooltip tooltip-left" data-tip={`Delete ${user.username}`}>
      <button
        type="button"
        className="btn btn-ghost btn-xs"
        aria-label={`Delete ${user.username}`}
        onClick={() => onDelete()}
      >
        <Trash2Icon className="w-4 h-4" />
      </button>
    </span>
  );
}

type UserAction = ["create", null] | ["update" | "delete", User];
type ActionsModalsProps = {
  userAction: UserAction;
  onClose: () => void;
};

function ActionsModals({
  userAction,
  onClose,
}: ActionsModalsProps): JSX.Element {
  const [action, user] = userAction;

  switch (action) {
    case "delete":
      return <DeleteUserModal user={user} onClose={onClose} />;
    case "update":
      return <UpdateUserModal user={user} onClose={onClose} />;
    case "create":
      return <CreateUserModal onClose={onClose} />;
  }
}

export function UsersList(): JSX.Element {
  const user = useRouteLoaderData("dashboard") as User;

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [userAction, setUserAction] = useState<UserAction | null>(null);

  const paginatedList = useQuery({
    queryKey: [...QueryConstants.USERS_SEARCH, search, page],
    queryFn: async () => searchAdmins(search, page),
    placeholderData: keepPreviousData,
  });

  const canDelete = useCallback(
    (otherUser: User) => {
      // If the user is trying to delete themselves
      if (user.id === otherUser.id) {
        return false;
      }

      // If the user is trying to delete an user with the same role
      if (user.role === otherUser.role) {
        return false;
      }

      // If an admin user is trying to delete another admin
      if (isInRole(user, Role.ADMIN) && !isInRole(otherUser, Role.USER)) {
        return false;
      }

      return true;
    },
    [user]
  );

  const canModify = useCallback(
    (otherUser: User) => {
      // If the user is trying to modify themselves
      if (user.id === otherUser.id) {
        return false;
      }

      // If the user isn't a superadmin
      if (!isInRole(user, Role.SUPERADMIN)) {
        return false;
      }

      // If the user is trying to update an user with the same role
      if (user.role === otherUser.role) {
        return false;
      }

      return true;
    },
    [user]
  );

  if (paginatedList.isLoading || paginatedList.isPending) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="text-accent w-14 h-14 animate-spin" />
      </div>
    );
  }

  if (paginatedList.isError) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-center text-error">
          An error occurred while fetching administrators.
        </p>
      </div>
    );
  }

  return (
    <div>
      <UsersHeader
        onSearch={setSearch}
        onCreate={() => setUserAction(["create", null])}
      />

      <main className="px-4 py-8">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th className="w-1/3">Username</th>
                <th className="w-1/3 text-center">Role</th>
                <th className="w-1/3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {paginatedList.data?.items?.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td className="text-center">
                    <span className="badge badge-secondary text-sm">
                      {u.role}
                    </span>
                  </td>
                  <td className="flex flex-row justify-end gap-2">
                    {canModify(u) && (
                      <UpdateButton
                        user={u}
                        onUpdate={() => setUserAction(["update", u])}
                      />
                    )}
                    {canDelete(u) && (
                      <DeleteButton
                        user={u}
                        onDelete={() => setUserAction(["delete", u])}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex flex-col items-center justify-center">
            <Pagination
              page={page}
              setPage={setPage}
              maxPages={2}
              totalPages={paginatedList.data?.totalPages ?? 0}
            />
          </div>
        </div>

        {userAction && (
          <ActionsModals
            userAction={userAction}
            onClose={() => setUserAction(null)}
          />
        )}
      </main>
    </div>
  );
}
