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
    <div className="w-full py-3 px-3">
      <div className="overflow-x-auto w-full border border-gray-100 bg-white rounded-xl shadow-sm">
        <table className="w-full min-w-[850px] text-xs text-left border-separate" style={{ borderSpacing: 0 }}>
          <thead className="text-gray-500 bg-gray-50 uppercase font-semibold">
            <tr>
              <th 
                className="w-[160px] min-w-[160px] max-w-[160px] px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ position: 'sticky', left: 0, zIndex: 20, backgroundColor: '#f9fafb' }}
                onClick={() => handleSort('companyName')}
              >
                Company <SortIcon columnKey="companyName" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap" onClick={() => handleSort('marketCap')}>
                <div className="flex flex-col">
                  <span className="inline-flex items-center gap-1">
                    Market Cap <SortIcon columnKey="marketCap" />
                  </span>
                  <span className="text-[10px] text-gray-400 normal-case font-normal mt-0.5">(In Cr)</span>
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap" onClick={() => handleSort('yoYSalesGrowth')}>
                YoY Rev <SortIcon columnKey="yoYSalesGrowth" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap" onClick={() => handleSort('yoYEbitdaGrowth')}>
                YoY EBITDA <SortIcon columnKey="yoYEbitdaGrowth" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap" onClick={() => handleSort('yoYPatGrowth')}>
                YoY PAT <SortIcon columnKey="yoYPatGrowth" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap" onClick={() => handleSort('qoQSalesGrowth')}>
                QoQ Rev <SortIcon columnKey="qoQSalesGrowth" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap" onClick={() => handleSort('qoQEbitdaGrowth')}>
                QoQ EBITDA <SortIcon columnKey="qoQEbitdaGrowth" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap" onClick={() => handleSort('qoQPatGrowth')}>
                QoQ PAT <SortIcon columnKey="qoQPatGrowth" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap" onClick={() => handleSort('ttmPe')}>
                TTM PE <SortIcon columnKey="ttmPe" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-500 whitespace-nowrap">No company data found.</td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td 
                    className="w-[160px] min-w-[160px] max-w-[160px] px-4 py-3 font-semibold text-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-gray-50 transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: '#ffffff' }}
                  >
                    {row.companyName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatNumber(row.marketCap)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatPercent(row.yoYSalesGrowth)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatPercent(row.yoYEbitdaGrowth)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatPercent(row.yoYPatGrowth)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatPercent(row.qoQSalesGrowth)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatPercent(row.qoQEbitdaGrowth)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatPercent(row.qoQPatGrowth)}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.ttmPe.toFixed(1)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
