import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CommunityProvider } from '@/context/CommunityContext'
import { PageLayout } from '@/components/layout/PageLayout'
import { CommunityFeedPage } from '@/pages/CommunityFeedPage'
import { QuestionDetailPage } from '@/pages/QuestionDetailPage'
import { AskQuestionPage } from '@/pages/AskQuestionPage'
import { SignInPage } from '@/pages/SignInPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { ProfileSetupPage } from '@/pages/ProfileSetupPage'
import { AccountActivatedPage } from '@/pages/AccountActivatedPage'
import { ProblemsProvider } from '@/context/ProblemsContext'
import { ProblemsPage } from '@/pages/ProblemsPage'
import { ProblemDetailPage } from '@/pages/ProblemDetailPage'
import { SubmitSolutionPage } from '@/pages/SubmitSolutionPage'
import { RequireMember } from '@/components/auth/RequireMember'
import { LandingPage } from '@/pages/LandingPage'

export default function App() {
  return (
    <AuthProvider>
      <CommunityProvider>
        <ProblemsProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/problems"
                element={
                  <PageLayout>
                    <ProblemsPage />
                  </PageLayout>
                }
              />
              <Route
                path="/problems/:id"
                element={
                  <PageLayout>
                    <ProblemDetailPage />
                  </PageLayout>
                }
              />
              <Route
                path="/problems/:id/submit-solution"
                element={
                  <PageLayout>
                    <RequireMember>
                      <SubmitSolutionPage />
                    </RequireMember>
                  </PageLayout>
                }
              />
              <Route path="/" element={<LandingPage />} />

              {/* Auth & Onboarding screens (standalone layouts) */}
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route
                path="/profile-setup"
                element={
                  <RequireMember>
                    <ProfileSetupPage />
                  </RequireMember>
                }
              />
              <Route
                path="/account-activated"
                element={
                  <RequireMember>
                    <AccountActivatedPage />
                  </RequireMember>
                }
              />

              {/* Community screens (inside standard PageLayout with shared navigation) */}
              <Route
                path="/community"
                element={
                  <PageLayout>
                    <CommunityFeedPage />
                  </PageLayout>
                }
              />
              <Route
                path="/community/questions/:id"
                element={
                  <PageLayout>
                    <QuestionDetailPage />
                  </PageLayout>
                }
              />
              <Route
                path="/community/ask"
                element={
                  <PageLayout>
                    <RequireMember>
                      <AskQuestionPage />
                    </RequireMember>
                  </PageLayout>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/community" replace />} />
            </Routes>
          </BrowserRouter>
        </ProblemsProvider>
      </CommunityProvider>
    </AuthProvider>
  )
}
