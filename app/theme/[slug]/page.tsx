import { ThemePageClient } from './ThemePageClient'
import { BottomNav } from '@/app/components/layout/BottomNav'

export default async function ThemePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  return (
    <div className="min-h-screen bg-bg-base flex w-full">
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 lg:w-60 bg-bg-surface border-r border-border-subtle z-40 py-4">
        <div className="flex items-center gap-3 px-4 mb-8">
          <span className="text-accent text-2xl">≋</span>
          <span className="hidden lg:block font-display font-bold text-lg text-ktext-primary">Kaikansen</span>
        </div>
      </nav>
      
      <main className="flex-1 min-w-0 pb-20 md:pb-0 md:pl-20 lg:pl-60 w-full">
        <ThemePageClient slug={slug} />
      </main>
      
      <BottomNav />
    </div>
  )
}