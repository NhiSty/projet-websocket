import { fetchUser } from "#/api/auth.http";
import { QueryConstants } from "#/api/queryConstants";
import { QueryClient } from "@tanstack/react-query";
import { LoaderFunction, Outlet } from "react-router-dom";

export function authLoader(
  queryClient: QueryClient,
  callback: (connected: boolean) => void
): LoaderFunction<void> {
  return async () => {
    try {
      const value = await queryClient.fetchQuery({
        queryKey: QueryConstants.USER,
        queryFn: fetchUser,
      });

      return callback(Boolean(value));
    } catch (error) {
      return callback(false);
    }
  };
}

export default function AuthLayout(): JSX.Element {
  return (
    <div className="flex flex-row bg-base-200 min-h-screen">
      <div className="flex md:flex-1 bg-secondary/50 relative"></div>
      <section className="w-full md:max-w-screen-sm p-8 shadow-md flex flex-col min-h-screen justify-center items-center">
        <h1 className="text-4xl font-bold py-4 text-accent">
          Welcome to Wasoot
        </h1>

        <Outlet />
      </section>
    </div>
  );
}
