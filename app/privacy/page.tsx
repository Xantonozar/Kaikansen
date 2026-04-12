import { AppHeader } from '@/app/components/layout/AppHeader'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <AppHeader />
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-ktext-primary mb-4">Privacy Policy</h1>
        <div className="prose prose-invert">
          <p className="text-ktext-secondary mb-4">
            At Kaikansen, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information.
          </p>
          
          <h2 className="text-lg font-semibold text-ktext-primary mt-6 mb-2">Information We Collect</h2>
          <p className="text-ktext-secondary mb-4">
            We collect information you provide when creating an account, including email address and username. We also collect usage data to improve our service.
          </p>
          
          <h2 className="text-lg font-semibold text-ktext-primary mt-6 mb-2">How We Use Your Information</h2>
          <p className="text-ktext-secondary mb-4">
            Your information is used to provide and improve our services, authenticate your account, and communicate with you.
          </p>
          
          <h2 className="text-lg font-semibold text-ktext-primary mt-6 mb-2">Data Security</h2>
          <p className="text-ktext-secondary mb-4">
            We implement appropriate security measures to protect your personal information.
          </p>
          
          <p className="text-ktext-tertiary text-sm mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </main>
    </div>
  )
}