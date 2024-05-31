import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import DashboardLayout, { Dashboard } from './Home.tsx'
import { LoginForm } from './Login.tsx'
import RootLayout from './RootLayout.tsx'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { TooltipProvider } from '@radix-ui/react-tooltip'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/", element: <DashboardLayout />, children: [
          { element: <Dashboard />, index: true },
        ]
      },
      { path: "/login/*", element: <LoginForm /> },
      // { path: "/sign-up/*", element: <SignUpPage /> },
      // {
      //   element: <DashboardLayout />,
      //   path: "dashboard",
      //   children: [
      //     { path: "/dashboard", element: <DashboardPage /> },
      //     { path: "/dashboard/invoices", element: <InvoicesPage /> }
      //   ]
      // }
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