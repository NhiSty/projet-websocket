import { createBrowserRouter, redirect } from "react-router-dom";
import Home from "./pages/home";
import AuthLayout, { authLoader } from "./layouts/AuthLayout";
import { Login } from "./pages/login";
import { queryClient } from "./api/api";
import { BaseLayout } from "./layouts/BaseLayout";
import { logoutAction } from "./api/auth.queries";
import { Register } from "./pages/register";

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
