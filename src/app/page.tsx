'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const checkAuth = () => {
      const hasToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='));
      if (hasToken) {
        router.push('/home');
      } else {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}