'use strict';
const fs = require('fs');
const yahooFinance = require('yahoo-finance');

// Correct pattern for data downloader

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
const FILE = `${__dirname}/../data/historical-data.json`;

function getHistoricalData () {
  return yahooFinance.historical({
    symbols: SYMBOLS,
    from: START_DATE,
    to: END_DATE
  });
}

function main () {
  getHistoricalData()
    .then(result => {
      fs.appendFile(FILE, JSON.stringify(result), (err) => {
        if (err) throw err;
        console.log('Data downloaded');
      });
    }).catch(err => {
      console.log(err);
    });
}

main();
