import { calculateGrowth, getYoYQuarter, getPreviousQuarter, parseQuarter } from './calculations';

export function getLatestQuarterTableData(allData: any[]) {
  if (!allData || allData.length === 0) {
    return { data: [], latestQuarter: '' };
  }

  // Find the latest quarter globally, skipping quarters with 0 sales/ebitda/pat
  let latestQObj: { q: number; year: number } | null = null;
  let latestQuarterString = '';

  for (const item of allData) {
    if (!item.sales && !item.pat && !item.ebitda) continue;

    const parsed = parseQuarter(item.quarter);
    if (parsed) {
      if (!latestQObj || parsed.year > latestQObj.year || (parsed.year === latestQObj.year && parsed.q > latestQObj.q)) {
        latestQObj = parsed;
        latestQuarterString = item.quarter;
      }
    }
  }

  if (!latestQuarterString) {
    return { data: [], latestQuarter: '' };
  }

  // Group by company & quarter for quick lookup
  const lookup: Record<string, any> = {};
  for (const item of allData) {
    lookup[`${item.companyName}|${item.quarter}`] = item;
  }

  const industryData: Record<string, {
    companies: Set<string>;
    yoYCurrentSales: number; yoYSalesBase: number;
    yoYCurrentPat: number; yoYPatBase: number;
    yoYCurrentEbitda: number; yoYEbitdaBase: number;
    qoQCurrentSales: number; qoQSalesBase: number;
    qoQCurrentPat: number; qoQPatBase: number;
    qoQCurrentEbitda: number; qoQEbitdaBase: number;
  }> = {};

  for (const item of allData) {
    if (item.quarter !== latestQuarterString) continue;

    const ind = item.industry;
    if (!industryData[ind]) {
      industryData[ind] = {
        companies: new Set(),
        yoYCurrentSales: 0, yoYSalesBase: 0,
        yoYCurrentPat: 0, yoYPatBase: 0,
        yoYCurrentEbitda: 0, yoYEbitdaBase: 0,
        qoQCurrentSales: 0, qoQSalesBase: 0,
        qoQCurrentPat: 0, qoQPatBase: 0,
        qoQCurrentEbitda: 0, qoQEbitdaBase: 0,
      };
    }

    industryData[ind].companies.add(item.companyName);

    const prevYoYQ = getYoYQuarter(item.quarter);
    const prevQoQQ = getPreviousQuarter(item.quarter);

    const yoyItem = lookup[`${item.companyName}|${prevYoYQ}`];
    const qoqItem = lookup[`${item.companyName}|${prevQoQQ}`];

    if (yoyItem) {
      if (typeof yoyItem.sales === 'number' && typeof item.sales === 'number') {
        industryData[ind].yoYCurrentSales += item.sales;
        industryData[ind].yoYSalesBase += yoyItem.sales;
      }
      if (typeof yoyItem.pat === 'number' && typeof item.pat === 'number') {
        industryData[ind].yoYCurrentPat += item.pat;
        industryData[ind].yoYPatBase += yoyItem.pat;
      }
      if (typeof yoyItem.ebitda === 'number' && typeof item.ebitda === 'number') {
        industryData[ind].yoYCurrentEbitda += item.ebitda;
        industryData[ind].yoYEbitdaBase += yoyItem.ebitda;
      }
    }

    if (qoqItem) {
      if (typeof qoqItem.sales === 'number' && typeof item.sales === 'number') {
        industryData[ind].qoQCurrentSales += item.sales;
        industryData[ind].qoQSalesBase += qoqItem.sales;
      }
      if (typeof qoqItem.pat === 'number' && typeof item.pat === 'number') {
        industryData[ind].qoQCurrentPat += item.pat;
        industryData[ind].qoQPatBase += qoqItem.pat;
      }
      if (typeof qoqItem.ebitda === 'number' && typeof item.ebitda === 'number') {
        industryData[ind].qoQCurrentEbitda += item.ebitda;
        industryData[ind].qoQEbitdaBase += qoqItem.ebitda;
      }
    }
  }

  const calcGrowth = (current: number, base: number) => {
    if (base === 0) return 0;
    return ((current - base) / Math.abs(base)) * 100;
  };

  const result = Object.keys(industryData).map(ind => {
    const d = industryData[ind];
    return {
      industry: ind,
      companiesCount: d.companies.size,
      avgYoYSalesGrowth: calcGrowth(d.yoYCurrentSales, d.yoYSalesBase),
      avgYoYPatGrowth: calcGrowth(d.yoYCurrentPat, d.yoYPatBase),
      avgYoYEbitdaGrowth: calcGrowth(d.yoYCurrentEbitda, d.yoYEbitdaBase),
      avgQoQSalesGrowth: calcGrowth(d.qoQCurrentSales, d.qoQSalesBase),
      avgQoQPatGrowth: calcGrowth(d.qoQCurrentPat, d.qoQPatBase),
      avgQoQEbitdaGrowth: calcGrowth(d.qoQCurrentEbitda, d.qoQEbitdaBase),
    };
  });

  return { data: result, latestQuarter: latestQuarterString };
}

export function getCompanyDrilldownData(allData: any[], industry: string) {
  if (!allData || allData.length === 0) {
    return { data: [] };
  }

  // Find the latest quarter globally or within this industry, ignoring empty quarters
  let latestQObj: { q: number; year: number } | null = null;
  let latestQuarterString = '';

  const industryData = allData.filter(d => d.industry === industry);

  for (const item of industryData) {
    if (!item.sales && !item.pat && !item.ebitda) continue;
    
    const parsed = parseQuarter(item.quarter);
    if (parsed) {
      if (!latestQObj || parsed.year > latestQObj.year || (parsed.year === latestQObj.year && parsed.q > latestQObj.q)) {
        latestQObj = parsed;
        latestQuarterString = item.quarter;
      }
    }
  }

  const lookup: Record<string, any> = {};
  for (const item of industryData) {
    lookup[`${item.companyName}|${item.quarter}`] = item;
  }

  const result = [];

  for (const item of industryData) {
    if (item.quarter !== latestQuarterString) continue;

    const prevYoYQ = getYoYQuarter(item.quarter);
    const prevQoQQ = getPreviousQuarter(item.quarter);

    const yoyItem = lookup[`${item.companyName}|${prevYoYQ}`];
    const qoqItem = lookup[`${item.companyName}|${prevQoQQ}`];

    result.push({
      companyName: item.companyName,
      marketCap: item.marketCap,
      ttmPe: item.ttmPe,
      yoYSalesGrowth: yoyItem ? calculateGrowth(item.sales, yoyItem.sales) : 0,
      yoYPatGrowth: yoyItem ? calculateGrowth(item.pat, yoyItem.pat) : 0,
      yoYEbitdaGrowth: yoyItem ? calculateGrowth(item.ebitda, yoyItem.ebitda) : 0,
      qoQSalesGrowth: qoqItem ? calculateGrowth(item.sales, qoqItem.sales) : 0,
      qoQPatGrowth: qoqItem ? calculateGrowth(item.pat, qoqItem.pat) : 0,
      qoQEbitdaGrowth: qoqItem ? calculateGrowth(item.ebitda, qoqItem.ebitda) : 0,
    });
  }

  return { data: result };
}

export function getIndustryPerformanceChartData(allData: any[], industry: string, numQuarters: number) {
  if (!allData || allData.length === 0) {
    return { data: [], industries: [] };
  }

  const filteredData = industry 
    ? allData.filter(d => d.industry === industry)
    : allData;

  const validData = filteredData.filter(d => d.sales || d.pat || d.ebitda);
  const uniqueQuarters = Array.from(new Set(validData.map(d => d.quarter)));
  const sortedQuarters = uniqueQuarters
    .map(q => ({ qStr: q, parsed: parseQuarter(q) }))
    .filter(q => q.parsed !== null)
    .sort((a, b) => {
      if (a.parsed!.year !== b.parsed!.year) return a.parsed!.year - b.parsed!.year;
      return a.parsed!.q - b.parsed!.q;
    });

  const recentQuarters = sortedQuarters.slice(-numQuarters).map(q => q.qStr);

  const lookup: Record<string, any> = {};
  for (const item of filteredData) {
    lookup[`${item.companyName}|${item.quarter}`] = item;
  }

  const chartData = [];

  for (const q of recentQuarters) {
    let currentSales = 0, baseSales = 0;
    let currentEbitda = 0, baseEbitda = 0;
    let currentPat = 0, basePat = 0;
    let resultsCount = 0;

    for (const item of filteredData) {
      if (item.quarter !== q) continue;

      const prevYoYQ = getYoYQuarter(item.quarter);
      const yoyItem = lookup[`${item.companyName}|${prevYoYQ}`];

      if (yoyItem) {
        resultsCount++;
        if (typeof yoyItem.sales === 'number' && typeof item.sales === 'number') {
          currentSales += item.sales;
          baseSales += yoyItem.sales;
        }
        if (typeof yoyItem.ebitda === 'number' && typeof item.ebitda === 'number') {
          currentEbitda += item.ebitda;
          baseEbitda += yoyItem.ebitda;
        }
        if (typeof yoyItem.pat === 'number' && typeof item.pat === 'number') {
          currentPat += item.pat;
          basePat += yoyItem.pat;
        }
      }
    }

    const calcGrowth = (current: number, base: number) => {
      if (base === 0) return 0;
      return ((current - base) / Math.abs(base)) * 100;
    };

    chartData.push({
      quarter: q,
      resultsCount,
      revenueGrowth: calcGrowth(currentSales, baseSales),
      ebitdaGrowth: calcGrowth(currentEbitda, baseEbitda),
      patGrowth: calcGrowth(currentPat, basePat),
    });
  }

  const allIndustries = Array.from(new Set(allData.map(d => d.industry))).sort();

  return { data: chartData, industries: allIndustries };
}
