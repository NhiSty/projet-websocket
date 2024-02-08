import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/home";
import AuthLayout, { authLoader } from "./layouts/AuthLayout";
import { Login } from "./pages/login";
import { queryClient } from "./api/api";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <div>Not Found</div>,
    children: [
      {
        path: "",
        element: <Home />,
      },
    ],
  },
  {
    path: "",
    element: <AuthLayout />,
    loader: authLoader(queryClient),
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <div>Register</div>,
      },
    ],
  },
]);

export default router;
