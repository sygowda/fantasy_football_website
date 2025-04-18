import React, { useEffect } from 'react'
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };

    checkSession();
  }, [router]);

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-green-800 dark:text-green-100">Welcome to Fantasy App</h1>
          <p className="text-lg text-green-700 dark:text-green-200">Create your dream team and compete with others!</p>
          <div className="space-x-4">
            <a 
              href="/login" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Login
            </a>
            <a 
              href="/register" 
              className="inline-block bg-white hover:bg-gray-100 text-green-600 font-semibold py-2 px-6 rounded-lg border border-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
