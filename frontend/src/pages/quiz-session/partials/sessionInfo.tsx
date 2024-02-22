import { useQuizSession } from "#/providers/quiz";
import { Crown } from "lucide-react";

export function SessionInfo(): JSX.Element {
  const { users, quiz } = useQuizSession();

  return (
    <section className="p-2 px-4 flex flex-col gap-2">
      <h2 className="uppercase text-sm">Users</h2>

      <ul className="grid grid-cols-2 grid-flow-row gap-1">
        {users.map((user) => (
          <li
            className="bg-base-200 hover:bg-primary px-4 py-2 rounded-md inline-flex items-center justify-between gap-1 group"
            key={user.id}
          >
            {user.username}
            {user.id === quiz?.author.id && (
              <Crown className="w-5 h-5 inline mr-1 text-gray-500 group-hover:text-primary-content" />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
