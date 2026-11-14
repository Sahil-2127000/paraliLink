import { domAnimation, LazyMotion } from 'motion/react'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { SiteLayout } from './components/layout/SiteLayout'
import { AuthProvider } from './features/auth/AuthContext'
import { RequireAuth } from './features/auth/RequireAuth'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

// Everything behind sign-in loads on demand, so the landing page stays light.
const SignInPage = lazy(() => import('./features/auth/SignInPage'))
const FarmerLayout = lazy(() => import('./features/farmer/FarmerLayout'))
const FarmerHomePage = lazy(() => import('./features/farmer/pages/FarmerHomePage'))
const SellPage = lazy(() => import('./features/farmer/pages/SellPage'))
const ListingsPage = lazy(() => import('./features/farmer/pages/ListingsPage'))
const ListingDetailPage = lazy(() => import('./features/farmer/pages/ListingDetailPage'))
const MoneyPage = lazy(() => import('./features/farmer/pages/MoneyPage'))
const BalerBookingPage = lazy(() => import('./features/farmer/pages/BalerBookingPage'))

function PageFallback() {
  return (
    <div role="status" className="flex min-h-svh items-center justify-center">
      <span className="label text-stone">Loading…</span>
    </div>
  )
}

const withSuspense = (element) => <Suspense fallback={<PageFallback />}>{element}</Suspense>

const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/login', element: withSuspense(<SignInPage />) },
  {
    element: <RequireAuth roles={['farmer']} />,
    children: [
      {
        path: '/farmer',
        element: withSuspense(<FarmerLayout />),
        children: [
          { index: true, element: withSuspense(<FarmerHomePage />) },
          { path: 'sell', element: withSuspense(<SellPage />) },
          { path: 'listings', element: withSuspense(<ListingsPage />) },
          { path: 'listings/:id', element: withSuspense(<ListingDetailPage />) },
          { path: 'money', element: withSuspense(<MoneyPage />) },
          { path: 'baler', element: withSuspense(<BalerBookingPage />) },
        ],
      },
    ],
  },
])

export default function App() {
  // LazyMotion + `m` components ship only the animation features we use.
  // `strict` throws if someone uses `motion.*` by mistake.
  return (
    <LazyMotion features={domAnimation} strict>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </LazyMotion>
  )
}
