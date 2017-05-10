'use strict';
const fs = require('fs');
const yahooFinance = require('yahoo-finance');

const SYMBOLS= [
  'SPY',
  'QQQ',
  'IWM',
  'TLT',
  'DIA',
  'AAPL',
  'BABA',
  'C',
  'FB',
  'GLD',
  'DIS',
  'JPM',
  'SBUX',
  'ADBE',
  'BA',
  'DE',
  'FXE',
  'GS',
  'HD',
  'HON',
  'JNJ',
  'MA',
  'NFLX',
  'NVDA',
  'PEP',
  'PM',
  'BIDU',
  'COST',
  'XLE',
  'IBM',
  'CAT',
  'BUD',
  'WMT',
  'CVS',
  'CVX',
  'CELG',
  'WDC',
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
