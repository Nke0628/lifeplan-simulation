import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">設定</h1>
      <p>設定画面</p>
    </div>
  );
}
