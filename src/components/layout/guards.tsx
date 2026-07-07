import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '@/components/atoms/Spinner'
import { useAuth } from '@/features/auth/AuthProvider'

function FullScreenSpinner() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg text-primary">
      <Spinner className="size-8" />
    </div>
  )
}

/** Blocks app routes for unauthenticated users; waits while re-authenticating. */
export function ProtectedRoute() {
  const { status } = useAuth()
  if (status === 'loading') return <FullScreenSpinner />
  return status === 'authed' ? <Outlet /> : <Navigate to="/login" replace />
}

/** Keeps authenticated users out of /login and /register. */
export function PublicOnlyRoute() {
  const { status } = useAuth()
  if (status === 'loading') return <FullScreenSpinner />
  return status === 'authed' ? <Navigate to="/dashboard" replace /> : <Outlet />
}
