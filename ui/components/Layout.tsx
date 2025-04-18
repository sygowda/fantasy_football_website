import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-green-100 to-green-50 dark:from-green-800 dark:via-green-900 dark:to-green-950 text-gray-900 dark:text-white px-4 py-8">
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-green-200 dark:border-green-700">
        {/* Left: App Info */}
        <div className="p-6 flex flex-col justify-center bg-gradient-to-br from-green-100 via-green-50 to-white dark:from-green-800 dark:via-green-900 dark:to-green-950">
          <h1 className="text-3xl font-bold mb-3 text-green-800 dark:text-green-100">Fantasy Football Weekly</h1>
          <p className="text-base text-green-700 dark:text-green-200 mb-4">
            Build your dream football team each week, track performance, and rise up the leaderboard. Play with friends or go solo. Admins update scores and open registrations weekly.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">Weekly Team Selection</span>
            </div>
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm">Real-time Score Updates</span>
            </div>
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm">Compete with Friends</span>
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
} 