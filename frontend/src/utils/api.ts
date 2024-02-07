import { isServer } from "@tanstack/react-query";

export const HOST_URL = isServer
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.BACKEND_API_URL;
