'use strict';

const fs = require('fs');
const yahooFinance = require('yahoo-finance');
const moment = require('moment');

/*
  Downloader Notes:
  - populate values based date instead of searching for each date
  - search for starting date in order to populate existing values
  - generate array of dates given the range without weekends, populate values accordingly
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

/*
  array of dates approach
  combining data
  loop through objects
*/

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

    // let formattedData = formatBacktestStyle(bareMarketData);
    // console.log(formattedData);
    // let formattedData = formatData(bareMarketData);
    // console.log(generateDateRange(START_DATE, END_DATE));

    // formattedData = adjustHistoricalDate(formattedData);
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

  const finalData = dates.map((date, index) => {
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

  console.log(JSON.stringify(finalData, null, 2));

  /*
  Desired result shape:
  [
    {
      date: xxx,
      symbols: {
        AAPL: {marketDataObject},
        SPY: {marketDataObject}
      }
    },
    {
      date: xxx,
      symbols: {
        AAPL: {marketDataObject},
        SPY: {marketDataObject}
      }
    }
  ]
  */
}

function formatData(bareMarketData) {
  // console.log(Object.keys(bareMarketData));
  // console.log(bareMarketData.SPY);
  // grab spy dates
    // then insert other information into spy dates
  const dates = bareMarketData.SPY.map(bar => bar.date);
  console.log(dates);
  for (let symbol of Object.keys(bareMarketData)) {
    if (symbol !== 'SPY') {
      const startDate = bareMarketData[symbol][0].date;
      /*
      for (let bar of bareMarketData[symbol]) {
        // insert data at correct date position (dates will match due to market opem days)
      }
      */
    }
  }
  /*
  for (let symbol of Object.keys(bareMarketData)) {
    for (let bar of bareMarketData[symbol]) {
      console.log(bar.date);
    }
  }
  */
}

function formatBacktestStyle(marketData) {
  const dates = generateDateRange(new Date(START_DATE), new Date(END_DATE));
  return dates.map(date => {
    return {
      date: date,
      bars: getBars(marketData, date)
    };
  });
}

function getBars(marketData, date) {
  const bars = {};
  SYMBOLS.map((symbol, index) => {
    bars[symbol] = getBarByDate(marketData[symbol], date);
  });
  // console.log('bars: ' + JSON.stringify(bars));
  return bars;
}

function getBarByDate(data, date) {
  // return data.filter(bar => new Date(bar.date) === new Date(date));
  return data.filter(bar => moment(bar.date).isSame(date, 'day'));
}

function datesEqual(date1, date2) {
  /*
  return date1.getDay() === date2.getDay() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getFullYear() == date2.getFullYear();
  */
  return date1.toDateString() === date2.toDateString();
}

/*
function nextDate(date) {
  return new Date(date.setDate(date.getDate() + 1));
}

function generateDateRange(startDate, endDate) {
  const dates = [];
  let currentDate = startDate;
  while(currentDate <= endDate) {
    const mDate = moment(currentDate);
    if (mDate.isoWeekday() !== 6 && mDate.isoWeekday() !== 7) {
      dates.push(currentDate);
    }
    currentDate = nextDate(currentDate);
  }
  return dates;
}
*/

function generateDateRange(startDate, endDate) {
  const dates = [];
  startDate = moment(startDate);
  endDate = moment(endDate);
  let currentDate = startDate.clone();
  while(currentDate <= endDate) {
    if (currentDate.isoWeekday() !== 6 && currentDate.isoWeekday() !== 7) {
      dates.push(currentDate);
    }
    currentDate = currentDate.clone().add(1, 'days');
  }
  return dates;
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

/*
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
*/
