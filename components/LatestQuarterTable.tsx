'use client';

import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    if (val > 0) return <span className="text-green-600 font-medium">+{formatted}</span>;
    if (val < 0) return <span className="text-red-600 font-medium">{formatted}</span>;
    return <span className="text-gray-500 font-medium">{formatted}</span>;
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof IndustryData }) => {
    if (sortConfig?.key !== columnKey) return <ChevronDown className="w-4 h-4 text-gray-300 inline ml-1" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-500 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-500 inline ml-1" />
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Latest Quarter Performance <span className="text-sm font-normal text-gray-500 ml-2">({latestQuarter})</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 font-medium">Industry</th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('companiesCount')}>
                No. of Companies <SortIcon columnKey="companiesCount" />
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('avgYoYSalesGrowth')}>
                YoY Rev <SortIcon columnKey="avgYoYSalesGrowth" />
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('avgYoYEbitdaGrowth')}>
                YoY EBITDA <SortIcon columnKey="avgYoYEbitdaGrowth" />
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('avgYoYPatGrowth')}>
                YoY PAT <SortIcon columnKey="avgYoYPatGrowth" />
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('avgQoQSalesGrowth')}>
                QoQ Rev <SortIcon columnKey="avgQoQSalesGrowth" />
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('avgQoQEbitdaGrowth')}>
                QoQ EBITDA <SortIcon columnKey="avgQoQEbitdaGrowth" />
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('avgQoQPatGrowth')}>
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
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setExpandedIndustry(expandedIndustry === row.industry ? null : row.industry)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                      >
                        {row.industry}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{row.companiesCount}</td>
                    <td className="px-6 py-4">{formatPercent(row.avgYoYSalesGrowth)}</td>
                    <td className="px-6 py-4">{formatPercent(row.avgYoYEbitdaGrowth)}</td>
                    <td className="px-6 py-4">{formatPercent(row.avgYoYPatGrowth)}</td>
                    <td className="px-6 py-4">{formatPercent(row.avgQoQSalesGrowth)}</td>
                    <td className="px-6 py-4">{formatPercent(row.avgQoQEbitdaGrowth)}</td>
                    <td className="px-6 py-4">{formatPercent(row.avgQoQPatGrowth)}</td>
                  </tr>
                  
                  <AnimatePresence>
                    {expandedIndustry === row.industry && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-gray-50/80 border-t border-b border-gray-100"
                          >
                            <CompanyDrilldownTable industry={row.industry} allData={allData} />
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
