'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IndustryPerformanceChart from '@/components/IndustryPerformanceChart';
import LatestQuarterTable from '@/components/LatestQuarterTable';

export default function Dashboard() {
  const router = useRouter();
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('isLoggedIn');
    if (authStatus !== 'true') {
      router.replace('/login');
      return;
    }
    setIsCheckingAuth(false);

    async function loadData() {
      try {
        const basePath = process.env.__NEXT_ROUTER_BASEPATH || '';
        const res = await fetch(`${basePath}/data.json?t=${Date.now()}`);
        const json = await res.json();
        setAllData(json || []);
      } catch (err) {
        console.error('Failed to fetch static data.json:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleSignOut = () => {
    sessionStorage.removeItem('isLoggedIn');
    router.replace('/login');
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans w-full max-w-full overflow-x-hidden">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Result Dashboard
            </h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600 font-medium">Loading Dashboard Data...</span>
          </div>
        ) : (
          <>
            {/* Chart Section */}
            <section>
              <IndustryPerformanceChart allData={allData} />
            </section>

            {/* Table Section */}
            <section>
              <LatestQuarterTable allData={allData} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

