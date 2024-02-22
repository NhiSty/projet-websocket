import { Link } from "react-router-dom";

export function ErrorModal({ error }: { error: string }): JSX.Element {
  return (
    <div className="card bg-base-100 rounded-lg border border-base-300">
      <div className="card-body">
        <h2 className="card-title">{error}</h2>

        <Link to="/" className="btn btn-primary">
          Go back
        </Link>
      </div>
    </div>
  );
}
