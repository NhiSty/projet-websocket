import { createBrowserRouter, redirect } from "react-router-dom";
import Home from "./pages/home";
import AuthLayout, { authLoader } from "./layouts/AuthLayout";
import { Login } from "./pages/login";
import { queryClient } from "./api/api";
import { BaseLayout } from "./layouts/BaseLayout";
import { logoutAction } from "./api/auth.queries";
import { Register } from "./pages/register";
import { Dashboard, dashboardLoader } from "./pages/dashboard/dasboard";
import { UsersList } from "./pages/dashboard/users";

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
            element: <div>Quizzes</div>,
          },
          {
            path: "quiz/:id",
            element: <div>Quiz</div>,
          },
          {
            path: "quiz/:id/edit",
            element: <div>Edit Quiz</div>,
          },
          {
            path: "quiz/:id/results",
            element: <div>Quiz Results</div>,
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
