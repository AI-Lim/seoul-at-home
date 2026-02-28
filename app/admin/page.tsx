'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '../../screens/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (!auth) {
      router.replace('/admin-login');
    }
  }, []);

  return <AdminDashboard />;
}