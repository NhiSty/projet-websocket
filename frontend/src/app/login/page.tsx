import { LoginForm } from "#/partials/LoginForm";
import Link from "next/link";

export default function Page(): JSX.Element {
  return (
    <div className="flex flex-row bg-base-200 min-h-screen">
      <div className="flex md:flex-1 bg-secondary/50 relative"></div>
      <section className="w-full md:max-w-screen-sm p-8 shadow-md flex flex-col min-h-screen justify-center items-center">
        <h1 className="text-4xl font-bold py-4 text-accent">
          Welcome to Wasoot
        </h1>

        <LoginForm />

        <div className="flex flex-col justify-center py-2">
          <Link className="link-hover link-secondary text-sm" href="/register">
            Not registered? Register here
          </Link>
        </div>
      </section>
    </div>
  );
}
