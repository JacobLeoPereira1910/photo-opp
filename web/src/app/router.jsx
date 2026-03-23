import {
  Navigate,
  Outlet,
  createBrowserRouter,
  useLocation,
} from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { useAuth } from '../features/auth/auth-context.jsx'
import { ActivationFlowProvider } from '../features/activation/context/activation-flow-context.jsx'
import { Spinner } from '../components/ui/spinner.jsx'

const LoginPage = lazy(() =>
  import('../pages/login-page.jsx').then((module) => ({ default: module.LoginPage })),
)
const ResetPasswordPage = lazy(() =>
  import('../pages/reset-password-page.jsx').then((module) => ({ default: module.ResetPasswordPage })),
)
const ActivationWelcomePage = lazy(() =>
  import('../pages/activation-welcome-page.jsx').then((module) => ({ default: module.ActivationWelcomePage })),
)
const ActivationCameraPage = lazy(() =>
  import('../pages/activation-camera-page.jsx').then((module) => ({ default: module.ActivationCameraPage })),
)
const ActivationReviewPage = lazy(() =>
  import('../pages/activation-review-page.jsx').then((module) => ({ default: module.ActivationReviewPage })),
)
const ActivationSharePage = lazy(() =>
  import('../pages/activation-share-page.jsx').then((module) => ({ default: module.ActivationSharePage })),
)
const ActivationReactionPage = lazy(() =>
  import('../pages/activation-reaction-page.jsx').then((module) => ({ default: module.ActivationReactionPage })),
)
const ActivationThanksPage = lazy(() =>
  import('../pages/activation-thanks-page.jsx').then((module) => ({ default: module.ActivationThanksPage })),
)
const AdminDashboardPage = lazy(() =>
  import('../pages/admin-dashboard-page.jsx').then((module) => ({ default: module.AdminDashboardPage })),
)

function FullScreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#f5f1e6,transparent_55%),#181513]">
      <div className="glass-panel flex items-center gap-4 rounded-3xl px-6 py-5 text-stone-700">
        <Spinner className="text-stone-700" />
        <div>
          <p className="font-display text-lg font-semibold">Carregando ambiente</p>
          <p className="text-sm text-stone-500">Conectando com a ativação...</p>
        </div>
      </div>
    </div>
  )
}

function LazyRoute({ children }) {
  return <Suspense fallback={<FullScreenLoader />}>{children}</Suspense>
}

function ProtectedRoute({ allowedRoles }) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.isBootstrapping) {
    return <FullScreenLoader />
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles?.length && !allowedRoles.includes(auth.user?.role)) {
    return <Navigate to={auth.getDefaultRoute()} replace />
  }

  return <Outlet />
}

function PublicOnlyRoute() {
  const auth = useAuth()

  if (auth.isBootstrapping) {
    return <FullScreenLoader />
  }

  if (auth.isAuthenticated) {
    return <Navigate to={auth.getDefaultRoute()} replace />
  }

  return <Outlet />
}

function ActivationLayout() {
  const location = useLocation()

  return (
    <ActivationFlowProvider>
      <div key={location.pathname} className="activation-route-enter">
        <Outlet />
      </div>
    </ActivationFlowProvider>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <LazyRoute><LoginPage /></LazyRoute>,
      },
      {
        path: '/reset-password',
        element: <LazyRoute><ResetPasswordPage /></LazyRoute>,
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['admin', 'promoter']} />,
    children: [
      {
        path: '/activation',
        element: <ActivationLayout />,
        children: [
          { index: true, element: <LazyRoute><ActivationWelcomePage /></LazyRoute> },
          { path: 'camera', element: <LazyRoute><ActivationCameraPage /></LazyRoute> },
          { path: 'review', element: <LazyRoute><ActivationReviewPage /></LazyRoute> },
          { path: 'share', element: <LazyRoute><ActivationSharePage /></LazyRoute> },
          { path: 'reaction', element: <LazyRoute><ActivationReactionPage /></LazyRoute> },
          { path: 'thanks', element: <LazyRoute><ActivationThanksPage /></LazyRoute> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        path: '/admin',
        element: <LazyRoute><AdminDashboardPage /></LazyRoute>,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
