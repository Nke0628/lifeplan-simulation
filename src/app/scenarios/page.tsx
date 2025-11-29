import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ScenariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">シナリオ管理</h1>
      <p>シナリオ一覧がここに表示されます</p>
    </div>
  );
}
