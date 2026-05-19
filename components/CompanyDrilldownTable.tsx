'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getCompanyDrilldownData } from '@/lib/clientCalculations';

interface CompanyData {
  companyName: string;
  marketCap: number;
  ttmPe: number;
  yoYSalesGrowth: number;
  yoYPatGrowth: number;
  yoYEbitdaGrowth: number;
  qoQSalesGrowth: number;
  qoQPatGrowth: number;
  qoQEbitdaGrowth: number;
}

export default function CompanyDrilldownTable({ industry, allData }: { industry: string, allData: any[] }) {
  const [data, setData] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof CompanyData; direction: 'asc' | 'desc' } | null>({ key: 'marketCap', direction: 'desc' });

  useEffect(() => {
    if (!allData || allData.length === 0) return;

    setLoading(true);
    try {
      const { data: companiesData } = getCompanyDrilldownData(allData, industry);
      setData(companiesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [industry, allData]);

  const handleSort = (key: keyof CompanyData) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const formatPercent = (val: number) => {
    const formatted = val.toFixed(2) + '%';
    if (val > 0) return <span className="text-green-600">+{formatted}</span>;
    if (val < 0) return <span className="text-red-600">{formatted}</span>;
    return <span className="text-gray-500">{formatted}</span>;
  };

  const formatNumber = (val: number) => {
    if (val === undefined || val === null) return '-';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(val);
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof CompanyData }) => {
    if (sortConfig?.key !== columnKey) return <ChevronDown className="w-3 h-3 text-gray-300 inline ml-1" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-blue-500 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-500 inline ml-1" />
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500 flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span>Loading companies for {industry}...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="text-gray-500 bg-gray-50 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('companyName')}>
                Company <SortIcon columnKey="companyName" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('marketCap')}>
                <div className="flex flex-col">
                  <span className="inline-flex items-center gap-1">
                    Market Cap <SortIcon columnKey="marketCap" />
                  </span>
                  <span className="text-[10px] text-gray-400 normal-case font-normal mt-0.5">(In Cr)</span>
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('yoYSalesGrowth')}>
                YoY Rev <SortIcon columnKey="yoYSalesGrowth" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('yoYEbitdaGrowth')}>
                YoY EBITDA <SortIcon columnKey="yoYEbitdaGrowth" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('yoYPatGrowth')}>
                YoY PAT <SortIcon columnKey="yoYPatGrowth" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('qoQSalesGrowth')}>
                QoQ Rev <SortIcon columnKey="qoQSalesGrowth" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('qoQEbitdaGrowth')}>
                QoQ EBITDA <SortIcon columnKey="qoQEbitdaGrowth" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('qoQPatGrowth')}>
                QoQ PAT <SortIcon columnKey="qoQPatGrowth" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('ttmPe')}>
                TTM PE <SortIcon columnKey="ttmPe" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-500">No company data found.</td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{row.companyName}</td>
                  <td className="px-4 py-3 text-gray-600">{formatNumber(row.marketCap)}</td>
                  <td className="px-4 py-3">{formatPercent(row.yoYSalesGrowth)}</td>
                  <td className="px-4 py-3">{formatPercent(row.yoYEbitdaGrowth)}</td>
                  <td className="px-4 py-3">{formatPercent(row.yoYPatGrowth)}</td>
                  <td className="px-4 py-3">{formatPercent(row.qoQSalesGrowth)}</td>
                  <td className="px-4 py-3">{formatPercent(row.qoQEbitdaGrowth)}</td>
                  <td className="px-4 py-3">{formatPercent(row.qoQPatGrowth)}</td>
                  <td className="px-4 py-3 text-gray-600">{row.ttmPe.toFixed(1)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
