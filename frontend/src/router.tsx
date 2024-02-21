import { createBrowserRouter, redirect } from "react-router-dom";
import Home from "./pages/home";
import AuthLayout, { authLoader } from "./layouts/AuthLayout";
import { Login } from "./pages/login";
import { queryClient } from "./api/api";
import { BaseLayout } from "./layouts/BaseLayout";
import { logoutAction } from "./api/auth.queries";
import { Register } from "./pages/register";
import { Dashboard, dashboardLoader } from "./pages/dashboard/dashboard";
import { UsersList } from "./pages/dashboard/users";
import { Quizzes } from "./pages/dashboard/quizzes";
import { ViewQuiz, viewQuizLoader } from "./pages/dashboard/quizzes/viewQuiz";
import { EditQuiz, editQuizLoader } from "./pages/dashboard/quizzes/editQuiz";
import { PlayQuiz, playQuizLoader } from "./pages/dashboard/quizzes/playQuiz";
import {
  QuizSession,
  quizSessionLoader,
} from "./pages/quiz-session/quizSession";
import { WebSocketProvider } from "./providers/socketio/socketio";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "",
    errorElement: <div>Not Found</div>,
    element: <BaseLayout />,
    loader: authLoader(queryClient, (connected) => {
      if (!connected) return redirect("/login");
      return true;
    }),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
        loader: dashboardLoader(queryClient),
        id: "dashboard", // 'id' is used to identify the route in the 'useRouteLoaderData' hook
        children: [
          {
            path: "",
            element: <div>General</div>,
          },

          {
            path: "quizzes",
            children: [
              {
                path: "",
                element: <Quizzes />,
              },
              {
                path: ":id",
                element: <ViewQuiz />,
                id: "viewQuiz", // 'id' is used to identify the route in the 'useRouteLoaderData' hook
                loader: viewQuizLoader(queryClient),
              },
              {
                path: ":id/edit",
                element: <EditQuiz />,
                id: "editQuiz", // 'id' is used to identify the route in the 'useRouteLoaderData' hook
                loader: editQuizLoader(queryClient),
              },
              {
                path: ":id/play",
                element: <PlayQuiz />,
                id: "playQuiz", // 'id' is used to identify the route in the 'useRouteLoaderData' hook
                loader: playQuizLoader(queryClient),
              },
              {
                path: ":id/results",
                element: <div>Quiz Results</div>,
              },
            ],
          },

          {
            path: "users",
            element: <UsersList />,
          },
        ],
      },
      {
        path: "logout",
        element: <div>Logging out...</div>,
        loader: logoutAction(queryClient),
      },
    ],
  },
  {
    path: "quiz/session/:id",
    loader: quizSessionLoader(queryClient),
    element: (
      <WebSocketProvider>
        <QuizSession />
      </WebSocketProvider>
    ),
  },
  {
    path: "",
    element: <AuthLayout />,
    loader: authLoader(queryClient, (connected) => {
      if (connected) return redirect("/");
      return true;
    }),
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
]);

export default router;
