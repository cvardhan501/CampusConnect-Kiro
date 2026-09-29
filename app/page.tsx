import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/server/utils/jwt';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const token = cookies().get('accessToken')?.value;

  if (token) {
    const payload = await verifyAccessToken(token);
    if (payload) {
      const role = (payload.role || 'Student').toString().toLowerCase();
      if (role === 'administrator' || role === 'admin') {
        redirect('/admin');
      } else if (role === 'staff') {
        redirect('/staff');
      } else {
        redirect('/dashboard');
      }
    }
  }

  redirect('/login');
}
