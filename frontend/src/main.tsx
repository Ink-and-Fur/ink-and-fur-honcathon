import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import HomeLayout, { Home } from './Home.tsx'
import { LoginForm } from './Login.tsx'
import RootLayout from './RootLayout.tsx'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { TooltipProvider } from '@radix-ui/react-tooltip'

// import 'https://unpkg.com/paper-css@0.4.1/paper.min.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/", element: <HomeLayout />, children: [
          { element: <Home />, index: true },
        ]
      },
      // FOR ADE
      //
      // {
      //   path: "/pet/:id", element: <PetLayout />, children: [
      //     { element: <Pet /> },
      //   ]
      // },
      { path: "/login/*", element: <LoginForm /> },
    ]
  }
])


// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  </React.StrictMode>,
)