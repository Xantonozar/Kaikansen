export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Kaikansen
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Discover, rate, and share your favorite anime opening and ending themes
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <a
              href="/login"
              className="btn btn-primary"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="btn btn-outline"
            >
              Create Account
            </a>
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="card p-6 text-center">
            <div className="text-3xl">🎵</div>
            <h3 className="mt-2 font-semibold">Explore Themes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse thousands of anime OP/ED themes from AnimeThemes
            </p>
          </div>

          <div className="card p-6 text-center">
            <div className="text-3xl">⭐</div>
            <h3 className="mt-2 font-semibold">Rate & Review</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Share your thoughts with 1-10 ratings and join the community
            </p>
          </div>

          <div className="card p-6 text-center">
            <div className="text-3xl">👥</div>
            <h3 className="mt-2 font-semibold">Connect</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Follow friends and discover new themes from their activity
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold">Ready to dive in?</h2>
          <p className="mt-2 text-muted-foreground">
            Join thousands of anime fans rating OP/ED themes
          </p>
          <a href="/register" className="btn btn-primary mt-4">
            Get Started
          </a>
        </div>
      </div>
    </div>
  )
}
