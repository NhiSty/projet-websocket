import { Navigate, createBrowserRouter, redirect } from "react-router-dom";
import Home from "./pages/home";
import AuthLayout from "./layouts/AuthLayout";
import { Login } from "./pages/login";
import { queryClient } from "./api/api";
import { BaseLayout } from "./layouts/BaseLayout";
import { logoutAction } from "./api/auth.queries";
import { Register } from "./pages/register";
import { Dashboard } from "./pages/dashboard/dashboard";
import { UsersList } from "./pages/dashboard/users";
import { Quizzes } from "./pages/dashboard/quizzes";
import { ViewQuiz } from "./pages/dashboard/quizzes/viewQuiz";
import { EditQuiz } from "./pages/dashboard/quizzes/editQuiz";
import { PlayQuiz } from "./pages/dashboard/quizzes/playQuiz";
import { QuizSession } from "./pages/quiz-session/quizSession";
import { WebSocketProvider } from "./providers/socketio/socketio";
import { ChatProvider } from "./providers/chat/chat";
import { QuizProvider } from "./providers/quiz/quizProvider";
import { authLoader } from "./layouts/authLayout.loader";
import { dashboardLoader } from "./pages/dashboard/dashboard.loader";
import { editQuizLoader } from "./pages/dashboard/quizzes/editQuiz.loader";
import { playQuizLoader } from "./pages/dashboard/quizzes/playQuiz.loader";
import { viewQuizLoader } from "./pages/dashboard/quizzes/viewQuiz.loader";
import { quizSessionLoader } from "./pages/quiz-session/quizSession.loader";

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
            element: <Navigate to="quizzes" />,
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
    id: "quizSession",
    element: (
      <WebSocketProvider>
        <QuizProvider>
          <ChatProvider>
            <QuizSession />
          </ChatProvider>
        </QuizProvider>
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
