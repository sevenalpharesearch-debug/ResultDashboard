'use client';

import { useState, useEffect } from 'react';
import IndustryPerformanceChart from '@/components/IndustryPerformanceChart';
import LatestQuarterTable from '@/components/LatestQuarterTable';

export default function Dashboard() {
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Result Dashboard
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
