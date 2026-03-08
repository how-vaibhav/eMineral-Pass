import { createClient } from '@/lib/supabaseServer';
import HostDashboardUI from './HostDashboardUI';
import { notFound } from 'next/navigation';

export default async function HostPage() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	console.log(user);
	if (!user) {
		notFound();
		return;
	}

	const { data: isHost } = await supabase.rpc('is_host');
	if (!isHost) notFound();
	return <HostDashboardUI />;
}
