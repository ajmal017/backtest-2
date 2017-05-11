'use strict';

const fs = require('fs');
const yahooFinance = require('yahoo-finance');

const SYMBOLS = [
  'AAPL', 'ABX', 'BABA', 'BBRY', 'C', 'CMCSA', 'CSCO',
  'DIS', 'EEM', 'F', 'FB', 'FCX', 'FXI', 'GE', 'GILD',
  'GLD', 'IWM', 'JCP', 'JPM', 'LNKD', 'MGM', 'MRK', 'MSFT',
  'MU', 'NEM', 'NKE', 'P', 'PBR', 'QQQ', 'SBUX', 'SLV',
  'SPY', 'SWN', 'TLT', 'TWTR', 'UNG', 'USO', 'VXX', 'VZ',
  'WMT', 'XOM', 'ADBE', 'ANF', 'AXP', 'BA', 'BBY', 'BX',
  'CAT', 'DDD', 'DE', 'DIA', 'EBAY', 'EWJ', 'FXE', 'GLW',
  'GS', 'HD', 'HON', 'HPQ', 'HTZ', 'JNJ', 'JNPR', 'LOW',
  'LULU', 'M', 'MA', 'MOS', 'MS', 'MYL', 'NFLX', 'NVDA',
  'OIH', 'ORCL', 'PEP', 'SCTY', 'SLB', 'SLW', 'STX', 'TBT',
  'TEVA', 'TGT', 'TXN', 'UAL', 'UVXY', 'V', 'XLB', 'BIDU',
  'COST', 'XLE', 'BUD', 'CVS', 'CVX', 'CELG', 'WDC'
];

const START_DATE = '2000-01-01';
const END_DATE = '2017-01-01';
const FILE = `${__dirname}/../data/data.json`;

main();

async function main() {
  try {
    const bareMarketData = await getHistoricalData();
    const backtestDateShape = formatDataShape(bareMarketData);
    const adjustedData = adjustHistoricalData(backtestDateShape);
    await saveDataToFile(adjustedData);
    console.log(`Data downloaded, file: ${FILE}`);
  } catch(error) {
    console.error(error);
  }
}

function saveDataToFile(data) {
  return new Promise((resolve, reject) => {
    fs.appendFile(FILE, JSON.stringify(data), err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function formatDataShape(bareMarketData) {
  const startingIndexes = {};
  const dates = bareMarketData.SPY.map(bar => bar.date);

  for (let symbol of Object.keys(bareMarketData)) {
    const startingDate = bareMarketData[symbol][0].date;
    const datesIndex = dates.findIndex(date => date.valueOf() === startingDate.valueOf());
    startingIndexes[symbol] = datesIndex;
  }

  return dates.map((date, index) => {
    const inputSymbols = {};
    for (let symbol of Object.keys(startingIndexes)) {
      if (index >= startingIndexes[symbol]) {
        inputSymbols[symbol] = bareMarketData[symbol][index];
      }
    }
    return {
      date: date,
      symbols: inputSymbols
    };
  });
}

function adjustHistoricalData(data) {
  return data.map(item => {
    const replacement = {};

    for (let symbol in item.symbols) {
      const reference = item.symbols[symbol];
      if (reference) {
        const adjRatio = reference.adjClose / reference.close;

        replacement[symbol] = {
          date: reference.date,
          open: (reference.open * adjRatio).toFixed(2),
          high: (reference.high * adjRatio).toFixed(2),
          low: (reference.low * adjRatio).toFixed(2),
          close: (reference.close * adjRatio).toFixed(2),
          volume: (reference.volume / adjRatio).toFixed(2),
          symbol: reference.symbol
        };
      } else {
        replacement[symbol] = item.symbols[symbol];
      }
    }

    return {
      date: item.date,
      symbols: replacement
    };
  });
}

function getHistoricalData() {
  return yahooFinance.historical({
    symbols: SYMBOLS,
    from: START_DATE,
    to: END_DATE
  });
}
