import type { RouteObject } from 'react-router'

import RequireSession from '@/features/auth/RequireSession'
import AdminPage from './AdminPage'

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: (
      <RequireSession roles={['ADMIN']}>
        <AdminPage />
      </RequireSession>
    ),
  },
]
