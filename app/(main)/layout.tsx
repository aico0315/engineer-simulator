import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/ui/Sidebar'
import PlantDecoration from '@/components/ui/PlantDecoration'

export const dynamic = 'force-dynamic'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // プロフィール情報を取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar profile={profile} />
      <main
        className="flex-1 overflow-y-auto relative"
        style={{
          backgroundImage: 'url(/bg-wall.jpg)',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'local',
        }}
      >
        <PlantDecoration />
        {children}
      </main>
    </div>
  )
}
