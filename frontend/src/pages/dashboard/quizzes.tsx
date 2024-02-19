import { searchQuiz } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Quiz, Role, User } from "#/api/types";
import { Button } from "#/components/form/Button";
import { FormController } from "#/components/form/FormController";
import { Input } from "#/components/form/Input";
import { Pagination } from "#/components/partials/Pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  FilePlus,
  FolderOpenIcon,
  Loader2,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useState, type JSX, FormEvent, useCallback } from "react";
import { Link, useRouteLoaderData } from "react-router-dom";
import { CreateQuizModal } from "./quizzes/createQuizModal";

interface QuizzesHeaderProps {
  onSearch: (search: string) => void;
  onCreate: () => void;
}

function QuizzesHeader({
  onSearch,
  onCreate,
}: QuizzesHeaderProps): JSX.Element {
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
          <FilePlus className="w-6 h-6" />
        </Button>
      </form>
    </header>
  );
}

interface ViewButtonProps {
  quiz: Quiz;
}

function ViewButton({ quiz }: ViewButtonProps): JSX.Element | null {
  return (
    <span className="tooltip tooltip-left" data-tip={`View ${quiz.name}`}>
      <Link
        to={`/dashboard/quizzes/${quiz.id}`}
        type="button"
        className="btn btn-ghost btn-xs"
        aria-label={`Show ${quiz.name}`}
      >
        <FolderOpenIcon className="w-4 h-4" />
      </Link>
    </span>
  );
}

interface DeleteButtonProps {
  quiz: Quiz;
  onDelete: () => void;
}

function DeleteButton({
  quiz,
  onDelete,
}: DeleteButtonProps): JSX.Element | null {
  return (
    <span className="tooltip tooltip-left" data-tip={`Delete ${quiz.name}`}>
      <button
        type="button"
        className="btn btn-ghost btn-xs"
        aria-label={`Delete ${quiz.name}`}
        onClick={() => onDelete()}
      >
        <Trash2Icon className="w-4 h-4" />
      </button>
    </span>
  );
}

type UserAction = ["create", null] | ["delete", Quiz];
type ActionsModalsProps = {
  userAction: UserAction;
  onClose: () => void;
};

function ActionsModals({
  userAction,
  onClose,
}: ActionsModalsProps): JSX.Element {
  const [action, quizz] = userAction;

  switch (action) {
    case "delete":
      return <></>;
    case "create":
      return <CreateQuizModal onClose={onClose} />;
  }
}

export function Quizzes(): JSX.Element {
  const user = useRouteLoaderData("dashboard") as User;

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [userAction, setUserAction] = useState<UserAction | null>(null);

  const paginatedList = useQuery({
    queryKey: [...QueryConstants.QUIZ_SEARCH, search, page],
    queryFn: async () => searchQuiz(search, page),
    placeholderData: keepPreviousData,
  });

  const canDelete = useCallback(
    (quiz: Quiz) => quiz.id === user.id || user.role === Role.SUPERADMIN,
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
      <QuizzesHeader
        onSearch={setSearch}
        onCreate={() => setUserAction(["create", null])}
      />

      <main className="px-4 py-8">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th className="w-1/3">Name</th>
                <th className="w-1/3 text-center">Author</th>
                <th className="w-1/3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* body */}
              {paginatedList.data?.items.map((quiz) => (
                <tr key={quiz.id}>
                  <td>{quiz.name}</td>
                  <td className="text-center">{quiz.author.username}</td>
                  <td className="flex flex-row justify-end gap-2">
                    <ViewButton quiz={quiz} />
                    {canDelete(quiz) && (
                      <DeleteButton
                        quiz={quiz}
                        onDelete={() => setUserAction(["delete", quiz])}
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
              maxPages={3}
              totalPages={paginatedList.data?.totalPages ?? 0}
            />
          </div>
        </div>
      </main>

      {userAction && (
        <ActionsModals
          userAction={userAction}
          onClose={() => setUserAction(null)}
        />
      )}
    </div>
  );
}