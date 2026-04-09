import { LoginForm } from '@/app/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Kaikansen</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Discover and rate anime opening & ending themes
          </p>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-xl font-semibold">Sign In</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
