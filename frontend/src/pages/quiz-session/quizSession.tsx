import { SessionHeader } from "./partials/header";
import { Quiz } from "#/api/types";
import { SessionSidebar } from "./partials/sidebar";
import { SessionContent } from "./partials/content";
import { useParams } from "react-router-dom";
import { useState } from "react";

export function QuizSession(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [sidebarExpanded, setExpandedSidebar] = useState<boolean>(false);

  if (!id) {
    return <div>Invalid session</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SessionHeader
        quiz={{} as Quiz}
        onExpandSidebar={(expand) => setExpandedSidebar(expand)}
        sidebarExpanded={sidebarExpanded}
        onEndSession={() => {}}
      />

      <div className="flex flex-row flex-1">
        <SessionContent />
        {sidebarExpanded && <SessionSidebar />}
      </div>
    </div>
  );
}
