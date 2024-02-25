import { useQuizSession } from "#/providers/quiz";
import { CrownIcon, Loader2Icon } from "lucide-react";

export function ContentEnded(): JSX.Element {
  const { users, quiz } = useQuizSession();

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Loader2Icon className="text-accent w-14 h-14 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="card bg-base-100 rounded-lg border border-base-300 w-full max-w-96 sm:max-w-screen-sm mx-auto">
        <div className="card-body">
          <h2 className="card-title">The session is over</h2>
          
          <p className="uppercase text-sm text-gray-600">Scores</p>
          <table className="table bg-base-200">
            <thead>
              <tr>
                <th className="w-1/5">Position</th>
                <th>Username</th>
                <th className="text-end w-1/5">Points</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((user) => user.id !== quiz.author.id)
                .sort((u1, u2) => u2.points - u1.points)
                .map((user, index) => (
                  <tr key={user.id}>
                    <td className="font-bold text-center">{index + 1}</td>
                    <td className="inline-flex gap-1 items-center w-full">
                      {user.username}
                      {index === 0 && (
                        <span className="relative w-5 h-5">
                          <CrownIcon className="top-1 w-full h-full inline mr-1 text-orange-400 fill-orange-400 group-hover:text-primary-content animate-bounce absolute" />
                        </span>
                      )}
                    </td>

                    <td className="text-gray-500 text-end">
                      {user.points} points
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
