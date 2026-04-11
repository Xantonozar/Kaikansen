import { ThemePageClient } from './ThemePageClient'

export default async function ThemePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <ThemePageClient slug={slug} />
}