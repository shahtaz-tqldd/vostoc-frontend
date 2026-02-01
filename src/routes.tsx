import { createBrowserRouter } from 'react-router-dom'
import LoginPage from './pages/auth/login'
import RoleIndexPage from './pages/role-index'
import { RoleLayout } from './layouts/role-layout'

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <RoleLayout />,
    children: [
      {
        index: true,
        element: <RoleIndexPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
])
