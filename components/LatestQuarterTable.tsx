'use client';

import { useState, useEffect, Fragment } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CompanyDrilldownTable from './CompanyDrilldownTable';
import { getLatestQuarterTableData } from '@/lib/clientCalculations';

interface IndustryData {
  industry: string;
  companiesCount: number;
  avgYoYSalesGrowth: number;
  avgYoYPatGrowth: number;
  avgYoYEbitdaGrowth: number;
  avgQoQSalesGrowth: number;
  avgQoQPatGrowth: number;
  avgQoQEbitdaGrowth: number;
}

export default function LatestQuarterTable({ allData }: { allData: any[] }) {
  const [data, setData] = useState<IndustryData[]>([]);
  const [latestQuarter, setLatestQuarter] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: keyof IndustryData; direction: 'asc' | 'desc' } | null>(null);
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!allData || allData.length === 0) return;

    setLoading(true);
    try {
      const { data: latestData, latestQuarter: lQ } = getLatestQuarterTableData(allData);
      setData(latestData);
      setLatestQuarter(lQ);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [allData]);

  const handleSort = (key: keyof IndustryData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const multiplier = direction === 'asc' ? 1 : -1;
    return a[key] > b[key] ? multiplier : -multiplier;
  });

  const formatPercent = (val: number) => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    const formatted = val.toFixed(2) + '%';
    const colorClass = val >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
    return <span className={colorClass}>{val > 0 ? '+' : ''}{formatted}</span>;
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof IndustryData }) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <span className="inline-block text-gray-300 ml-1 text-[10px]">↕</span>;
    }
    return sortConfig.direction === 'asc'
      ? <span className="inline-block text-blue-500 ml-1 text-[10px]">▲</span>
      : <span className="inline-block text-blue-500 ml-1 text-[10px]">▼</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-full relative">
      <div className="h-16 px-4 md:px-6 border-b border-gray-100 flex justify-between items-center bg-white w-full rounded-t-2xl" style={{ position: 'sticky', top: '64px', zIndex: 40 }}>
        <h2 className="text-lg md:text-xl font-bold text-gray-800 whitespace-nowrap">
          Latest Quarter Performance <span className="text-xs md:text-sm font-normal text-gray-500 ml-2">({latestQuarter})</span>
        </h2>
      </div>

      <div className="w-full max-w-full" style={{ position: 'relative', zIndex: 1 }}>
        <table className="w-full min-w-[1000px] text-sm text-left border-separate" style={{ borderSpacing: 0 }}>
          <thead className="text-xs text-gray-500 uppercase bg-gray-50" style={{ zIndex: 30 }}>
            <tr>
              <th 
                className="min-w-[250px] px-6 py-4 font-semibold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap bg-gray-50 left-0"
                style={{ position: 'sticky', top: '128px', zIndex: 40 }}
              >
                Industry
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap bg-gray-50" style={{ position: 'sticky', top: '128px', zIndex: 30 }} onClick={() => handleSort('companiesCount')}>
                No. of Companies <SortIcon columnKey="companiesCount" />
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap bg-gray-50" style={{ position: 'sticky', top: '128px', zIndex: 30 }} onClick={() => handleSort('avgYoYSalesGrowth')}>
                YoY Rev <SortIcon columnKey="avgYoYSalesGrowth" />
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap bg-gray-50" style={{ position: 'sticky', top: '128px', zIndex: 30 }} onClick={() => handleSort('avgYoYEbitdaGrowth')}>
                YoY EBITDA <SortIcon columnKey="avgYoYEbitdaGrowth" />
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap bg-gray-50" style={{ position: 'sticky', top: '128px', zIndex: 30 }} onClick={() => handleSort('avgYoYPatGrowth')}>
                YoY PAT <SortIcon columnKey="avgYoYPatGrowth" />
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap bg-gray-50" style={{ position: 'sticky', top: '128px', zIndex: 30 }} onClick={() => handleSort('avgQoQSalesGrowth')}>
                QoQ Rev <SortIcon columnKey="avgQoQSalesGrowth" />
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap bg-gray-50" style={{ position: 'sticky', top: '128px', zIndex: 30 }} onClick={() => handleSort('avgQoQEbitdaGrowth')}>
                QoQ EBITDA <SortIcon columnKey="avgQoQEbitdaGrowth" />
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap bg-gray-50" style={{ position: 'sticky', top: '128px', zIndex: 30 }} onClick={() => handleSort('avgQoQPatGrowth')}>
                QoQ PAT <SortIcon columnKey="avgQoQPatGrowth" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No data available. Please upload an Excel file.
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <Fragment key={row.industry}>
                  <tr className="hover:bg-gray-50/50 transition-colors group">
                    <td
                      className="min-w-[250px] px-6 py-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-gray-50 transition-colors whitespace-nowrap"
                      style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: '#ffffff' }}
                    >
                      <button
                        onClick={() => setExpandedIndustry(expandedIndustry === row.industry ? null : row.industry)}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center text-left w-full"
                      >
                        {expandedIndustry === row.industry ? (
                          <ChevronUp className="w-3 h-3 mr-1 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-3 h-3 mr-1 text-gray-400 shrink-0" />
                        )}
                        {row.industry}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">{row.companiesCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatPercent(row.avgYoYSalesGrowth)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatPercent(row.avgYoYEbitdaGrowth)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatPercent(row.avgYoYPatGrowth)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatPercent(row.avgQoQSalesGrowth)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatPercent(row.avgQoQEbitdaGrowth)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatPercent(row.avgQoQPatGrowth)}</td>
                  </tr>

                  {expandedIndustry === row.industry && (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-0 bg-gray-50/80"
                      >
                        <div className="bg-gray-50/80 border-t border-b border-gray-100">
                          <CompanyDrilldownTable industry={row.industry} allData={allData} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
