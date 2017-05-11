'use strict';

const fs = require('fs');
const yahooFinance = require('yahoo-finance');
const moment = require('moment');

/*
  TODO:
  X reshape data
  - adjust historical data
  - save to appropriate json file
*/

/*
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
*/

// console.log(JSON.stringify(finalData, null, 2));

const SYMBOLS = ['SPY', 'IWM'];
// const START_DATE = '2000-01-01';
const START_DATE = '2016-01-01';
const END_DATE = '2017-01-01';
const FILE = `${__dirname}/../data/data.json`;

main();

async function main() {
  try {
    const bareMarketData = await getHistoricalData();
    const backtestDateShape = formatDataShape(bareMarketData);
    console.log(backtestDateShape);
  } catch(error) {
    console.error(error);
  }
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

function adjustHistoricalData (data) {
  return data.map(item => {
    const adjRatio = item.adjClose / item.close;
    return {
      open: item.open * adjRatio,
      high: item.high * adjRatio,
      low: item.low * adjRatio,
      close: item.close * adjRatio,
      volume: item.volume / adjRatio,
      date: item.date,
      symbol: item.symbol
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
