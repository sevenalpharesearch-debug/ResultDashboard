'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getIndustryPerformanceChartData } from '@/lib/clientCalculations';

const CustomXAxisTick = ({ x, y, payload }: any) => {
  if (typeof payload.value === 'string' && payload.value.includes('|||')) {
    const [quarter, results] = payload.value.split('|||');
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={11} fontWeight={500}>
          {quarter}
        </text>
        <text x={0} y={0} dy={32} textAnchor="middle" fill="#888" fontSize={10}>
          {results}
        </text>
      </g>
    );
  }
  return (
    <text x={x} y={y} dy={16} textAnchor="middle" fill="#666" fontSize={11}>
      {payload.value}
    </text>
  );
};

const CustomLegend = () => {
  return (
    <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 pb-5 text-xs font-medium text-gray-700">
      <div className="flex items-center">
        <span className="w-3 h-3 mr-2 bg-[#5B8DEF]"></span>
        Median Revenue Growth YoY
      </div>
      <div className="flex items-center">
        <span className="w-3 h-3 mr-2 bg-[#6FCF97]"></span>
        Median Operating Profit Growth YoY
      </div>
      <div className="flex items-center">
        <span className="w-3 h-3 mr-2 bg-[#A78BFA]"></span>
        Median PAT Growth YoY
      </div>
    </div>
  );
};

interface ChartData {
  quarter: string;
  resultsCount: number;
  revenueGrowth: number;
  ebitdaGrowth: number;
  patGrowth: number;
  formattedLabel?: string;
}

export default function IndustryPerformanceChart({ allData }: { allData: any[] }) {
  const [data, setData] = useState<ChartData[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [quarterRange, setQuarterRange] = useState<number>(6); // Default 6Q to match the snippet somewhat
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!allData || allData.length === 0) return;

    setLoading(true);
    try {
      const { data: chartData, industries: inds } = getIndustryPerformanceChartData(allData, selectedIndustry, quarterRange);

      const formattedData = (chartData || []).map((d: any) => {
        let formattedQuarter = d.quarter;
        const match = d.quarter?.match(/Q([1-4])\s*(?:FY)?(\d{2,4})/i);
        if (match) {
          const q = parseInt(match[1], 10);
          let fyYear = parseInt(match[2], 10);
          if (fyYear < 100) fyYear += 2000;

          let monthStr = '';
          let calYear = fyYear;

          if (q === 4) {
            monthStr = 'Mar';
          } else if (q === 1) {
            monthStr = 'Jun';
            calYear -= 1;
          } else if (q === 2) {
            monthStr = 'Sep';
            calYear -= 1;
          } else if (q === 3) {
            monthStr = 'Dec';
            calYear -= 1;
          }

          const shortYear = calYear.toString().slice(-2);
          formattedQuarter = `${monthStr} '${shortYear}`;
        }
        return {
          ...d,
          formattedLabel: `${formattedQuarter}|||${(d.resultsCount || 0).toLocaleString()} results`
        };
      });

      setData(formattedData);
      if (inds && industries.length === 0) {
        setIndustries(inds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [allData, selectedIndustry, quarterRange]);

  const quarterOptions = [12, 9, 6, 4];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-xl font-bold text-gray-800">Industry Level Performance</h2>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48 bg-white"
          >
            <option value="">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          <div className="flex bg-gray-100 rounded-lg p-1">
            {quarterOptions.map((q) => (
              <button
                key={q}
                onClick={() => setQuarterRange(q)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${quarterRange === q
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {q}Q
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[400px] w-full relative">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/60 flex items-center justify-center z-10"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 30, right: 30, left: 0, bottom: 20 }}
            barGap={0}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f0f0f0" />
            <XAxis
              dataKey="formattedLabel"
              axisLine={{ stroke: '#f0f0f0' }}
              tickLine={false}
              tick={<CustomXAxisTick />}
              dy={10}
            />
            <YAxis
              axisLine={{ stroke: '#f0f0f0' }}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 11 }}
              label={{ value: 'YoY Growth (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#666', fontSize: 12 } }}
            />
            <Tooltip
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', fontSize: '12px', backgroundColor: '#ffffff' }}
              labelFormatter={(label) => {
                if (typeof label === 'string' && label.includes('|||')) {
                  const [quarter, results] = label.split('|||');
                  return `${quarter} (${results})`;
                }
                return label;
              }}
              formatter={(value: any, name: any) => [
                <span key="value" style={{ color: '#1F2937', fontWeight: 600 }}>{`${Number(value).toFixed(1)}%`}</span>,
                <span key="name" style={{ color: '#4B5563' }}>{name}</span>
              ]}
            />
            <Legend
              verticalAlign="top"
              content={<CustomLegend />}
            />
            <Bar dataKey="revenueGrowth" name="Median Revenue Growth YoY" fill="#5B8DEF">
              <LabelList dataKey="revenueGrowth" position="top" formatter={(val: any) => `${Number(val || 0).toFixed(1)}%`} style={{ fontSize: '10px', fill: '#4B5563', fontWeight: 600 }} />
            </Bar>
            <Bar dataKey="ebitdaGrowth" name="Median Operating Profit Growth YoY" fill="#6FCF97">
              <LabelList dataKey="ebitdaGrowth" position="top" formatter={(val: any) => `${Number(val || 0).toFixed(1)}%`} style={{ fontSize: '10px', fill: '#4B5563', fontWeight: 600 }} />
            </Bar>
            <Bar dataKey="patGrowth" name="Median PAT Growth YoY" fill="#A78BFA">
              <LabelList dataKey="patGrowth" position="top" formatter={(val: any) => `${Number(val || 0).toFixed(1)}%`} style={{ fontSize: '10px', fill: '#4B5563', fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
