import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/layout/guards'
import { AuthProvider } from '@/features/auth/AuthProvider'
// import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage' // email flows hidden
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { StyleguidePage } from '@/features/design-system/StyleguidePage'
import { KnowledgeBasePage } from '@/features/knowledge-base/KnowledgeBasePage'
import { PatientDetailPage } from '@/features/patients/PatientDetailPage'
import { PatientsPage } from '@/features/patients/PatientsPage'
import { ReportDetailPage } from '@/features/reports/ReportDetailPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { PublicReportPage } from '@/features/reports/PublicReportPage'
import { ScribePage } from '@/features/scribe/ScribePage'
import { SessionDetailPage } from '@/features/scribe/SessionDetailPage'
import { SessionsPage } from '@/features/scribe/SessionsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public auth routes */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* Email flows hidden: <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
            </Route>

            {/* Public shared report (no auth, no app shell) */}
            <Route path="/shared/:token" element={<PublicReportPage />} />

            {/* Standalone dev styleguide (no auth, no app shell) */}
            <Route
              path="/design-system"
              element={
                <div className="min-h-screen bg-bg p-7">
                  <StyleguidePage />
                </div>
              }
            />

            {/* Protected app routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/patients/:patientId" element={<PatientDetailPage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/sessions/:sessionId" element={<SessionDetailPage />} />
                <Route path="/scribe" element={<ScribePage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reports/:sessionId" element={<ReportDetailPage />} />
                <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
