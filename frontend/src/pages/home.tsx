import { useUser } from "#/api/auth.queries";
import { Navbar } from "#/components/partials/Navbar";
import { Link } from "react-router-dom";

export default function Home() {
  const { data: user } = useUser();
  return (
    <div className="min-h-screen flex flex-col">
      <header>
        <Navbar />

        <div className="hero bg-secondary-light h-96">
          <div className="hero-content text-center">
            <div className="max-w-lg">
              <h1 className="text-5xl font-bold">Welcome on Wasoot!</h1>
              <p className="py-6">
                Wasoot is a fun quiz platform for teachers and students.
              </p>
              {!user && (
                <Link to="/login" className="btn">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-between p-20 bg-base-200"></main>
    </div>
  );
}
