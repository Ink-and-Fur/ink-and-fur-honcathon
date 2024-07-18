import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import HomeLayout, { Home } from "./Home.tsx";
import { LoginForm } from "./Login.tsx";
import RootLayout from "./RootLayout.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { LoggedInLayout } from "./LoggedInLayout.tsx";
import { PetDetails } from "./PetDetails.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster.tsx";
import { Playground } from "./Playground.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomeLayout />,
        children: [
          { element: <Home />, index: true },
          { path: "pet/:name", element: <PetDetails /> },
        ],
      },
      { path: "/login/*", element: <LoginForm /> },
      {
        path: "/playground",
        element: <Playground />,
      }
    ],
  },
]);

const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>,
);
