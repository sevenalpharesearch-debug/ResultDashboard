const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Flexible mapping for sheet names to model properties.
const SHEET_TO_METRIC_MAP = {
  'sales': 'sales',
  'revenue': 'sales',
  'ebitda': 'ebitda',
  'pat': 'pat',
  'interest': 'interest',
  'market cap': 'marketCap',
  'marketcap': 'marketCap',
  'ttm pe': 'ttmPe',
  'pe': 'ttmPe',
};

// Flexible mapping for base columns.
const COLUMN_MAP = {
  'company': 'companyName',
  'company name': 'companyName',
  'industry': 'industry',
  'sector': 'sector',
};

function convertToQuarter(value) {
  const toFYFormat = (month, calendarYear) => {
    let q;
    let fyYear = calendarYear;
    
    if (month >= 0 && month <= 2) {
      q = 4;
    } else if (month >= 3 && month <= 5) {
      q = 1;
      fyYear += 1;
    } else if (month >= 6 && month <= 8) {
      q = 2;
      fyYear += 1;
    } else {
      q = 3;
      fyYear += 1;
    }
    
    return `Q${q} FY${fyYear % 100}`;
  };

  if (typeof value === 'number') {
    if (value > 20000 && value < 80000) {
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      return toFYFormat(date.getUTCMonth(), date.getUTCFullYear());
    }
    return null;
  }

  if (typeof value === 'string') {
    const str = value.trim();
    
    const mmmYyMatch = str.match(/^([A-Za-z]{3})-(\d{2,4})$/);
    if (mmmYyMatch) {
      const monthStr = mmmYyMatch[1].toLowerCase();
      let year = parseInt(mmmYyMatch[2], 10);
      if (year < 100) year += 2000;
      
      const monthMap = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };
      
      const month = monthMap[monthStr];
      if (month !== undefined) {
        return toFYFormat(month, year);
      }
    }

    const qMatch = str.match(/Q([1-4])\s*(?:FY)?(\d{2,4})/i);
    if (qMatch) {
      const q = parseInt(qMatch[1], 10);
      let year = parseInt(qMatch[2], 10);
      if (year < 100) year += 2000;
      return `Q${q} FY${year % 100}`;
    }

    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      return toFYFormat(date.getUTCMonth(), date.getUTCFullYear());
    }
  }

  return null;
}

function parseExcelData(buffer) {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const mergedData = {};

  for (const sheetName of workbook.SheetNames) {
    const normalizedSheetName = sheetName.toLowerCase().trim();
    
    let targetMetric = null;
    for (const [key, metric] of Object.entries(SHEET_TO_METRIC_MAP)) {
      if (normalizedSheetName.includes(key)) {
        targetMetric = metric;
        break;
      }
    }

    if (!targetMetric) {
      continue;
    }

    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    for (const row of rawData) {
      let companyName = '';
      let industry = 'Unknown';
      let sector = 'Unknown';

      const quarterValues = {};
      let staticMetricValue = null;

      for (const [colName, val] of Object.entries(row)) {
        const normalizedCol = colName.toLowerCase().trim();
        let mappedBaseCol = null;

        for (const [key, baseCol] of Object.entries(COLUMN_MAP)) {
          if (normalizedCol === key) {
            mappedBaseCol = baseCol;
            break;
          }
        }

        if (mappedBaseCol === 'companyName') {
          companyName = String(val).trim();
        } else if (mappedBaseCol === 'industry') {
          industry = String(val).trim();
        } else if (mappedBaseCol === 'sector') {
          sector = String(val).trim();
        } else {
          const quarterKey = convertToQuarter(colName);
          if (quarterKey) {
            const numVal = parseFloat(val);
            quarterValues[quarterKey] = isNaN(numVal) ? 0 : numVal;
          } else if (targetMetric === 'ttmPe' && (normalizedCol.includes('ttm') || normalizedCol === 'pe')) {
            const numVal = parseFloat(val);
            staticMetricValue = isNaN(numVal) ? 0 : numVal;
          }
        }
      }

      if (!companyName) continue;

      if (staticMetricValue !== null) {
        const uniqueKey = `${companyName}|__STATIC__`;
        if (!mergedData[uniqueKey]) {
           mergedData[uniqueKey] = { companyName, industry, sector, quarter: '__STATIC__' };
        }
        mergedData[uniqueKey][targetMetric] = staticMetricValue;
      }

      for (const [quarter, metricValue] of Object.entries(quarterValues)) {
        const uniqueKey = `${companyName}|${quarter}`;
        if (!mergedData[uniqueKey]) {
          mergedData[uniqueKey] = {
            companyName,
            industry,
            sector,
            quarter,
            sales: 0,
            ebitda: 0,
            pat: 0,
            interest: 0,
            marketCap: 0,
            ttmPe: 0,
          };
        }

        if (industry !== 'Unknown') mergedData[uniqueKey].industry = industry;
        if (sector !== 'Unknown') mergedData[uniqueKey].sector = sector;

        mergedData[uniqueKey][targetMetric] = metricValue;
      }
    }
  }

  const finalData = Object.values(mergedData).filter((d) => d.quarter !== '__STATIC__');
  const staticData = Object.values(mergedData).filter((d) => d.quarter === '__STATIC__');

  for (const staticItem of staticData) {
    for (const actualItem of finalData) {
      if (actualItem.companyName === staticItem.companyName) {
        if (staticItem.ttmPe !== undefined) actualItem.ttmPe = staticItem.ttmPe;
      }
    }
  }

  return finalData;
}

try {
  const sourcePath = path.join(__dirname, '..', 'source', 'Result Dashboard.xlsx');
  const outputPath = path.join(__dirname, '..', 'public', 'data.json');
  
  if (!fs.existsSync(sourcePath)) {
    console.error(`Excel file not found at ${sourcePath}`);
    process.exit(1);
  }
  
  console.log(`Parsing Excel file from: ${sourcePath}...`);
  const buffer = fs.readFileSync(sourcePath);
  const data = parseExcelData(buffer);
  
  console.log(`Successfully parsed ${data.length} records. Writing to ${outputPath}...`);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log('Data preparation finished successfully!');
} catch (err) {
  console.error('Error preparing data:', err);
  process.exit(1);
}
