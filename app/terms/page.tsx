import { AppHeader } from '@/app/components/layout/AppHeader'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <AppHeader />
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-ktext-primary mb-4">Terms of Service</h1>
        <div className="prose prose-invert">
          <p className="text-ktext-secondary mb-4">
            Welcome to Kaikansen. By using our service, you agree to these terms. Please read them carefully.
          </p>
          
          <h2 className="text-lg font-semibold text-ktext-primary mt-6 mb-2">Using Our Service</h2>
          <p className="text-ktext-secondary mb-4">
            You agree to use Kaikansen in accordance with these terms and not to violate any applicable laws or regulations.
          </p>
          
          <h2 className="text-lg font-semibold text-ktext-primary mt-6 mb-2">Account Responsibilities</h2>
          <p className="text-ktext-secondary mb-4">
            You are responsible for maintaining the security of your account and for all activities under your account.
          </p>
          
          <h2 className="text-lg font-semibold text-ktext-primary mt-6 mb-2">Content</h2>
          <p className="text-ktext-secondary mb-4">
            All content on Kaikansen is for informational and entertainment purposes only.
          </p>
          
          <h2 className="text-lg font-semibold text-ktext-primary mt-6 mb-2">Changes to Terms</h2>
          <p className="text-ktext-secondary mb-4">
            We may update these terms from time to time. Continued use of the service constitutes acceptance of any changes.
          </p>
          
          <p className="text-ktext-tertiary text-sm mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </main>
    </div>
  )
}