'use strict';

const fs = require('fs');

const DATA_FILE = `${__dirname}/../data/historical-data.json`;

class BacktestException {
  constructor(message) {
    this.message = message;
    this.name = 'BacktestException';
  }
}

class Backtest {
  static validateDate(date) {
    if (date instanceof Date) {
      return date;
    } else if (typeof date === 'string') {
      return new Date(date);
    } else {
      throw new BacktestException('startDate and endDate parameters need to be strings or date objects.');
    }
  }

  static validateDateRange(startDate, endDate) {
    if (startDate >= endDate) {
      throw new BacktestException('startDate must be less than and not equal to endDate.');
    }
  }

  constructor(
    capital,
    indicators,
    startDate,
    endDate
  ) {
    this.dataFile = DATA_FILE;
    this.capital = capital;
    this.indicators = indicators;
    this.startDate = Backtest.validateDate(startDate);
    this.endDate = Backtest.validateDate(endDate);
    Backtest.validateDateRange(this.startDate, this.endDate);
    this.main();
  }

  async main() {
    try {
      const baseMarketData = await this.getMarketData();
      // adjust historical data (baseMarketData)
      const adjMarketData = this.adjustHistoricalData(baseMarketData);
      // build talib market data inputs (special shape)
      // build backtesting shape
    } catch(err) {
      console.error(err);
    }
  }

  adjustHistoricalData(data) {
    return Object.keys(data).map(symbol => {
      return data[symbol].map(bar => {
        const adjRatio = bar.adjClose / bar.close;
        return {
          open: (bar.open * adjRatio).toFixed(2),
          high: (bar.high * adjRatio).toFixed(2),
          low: (bar.low * adjRatio).toFixed(2),
          close: (bar.close * adjRatio).toFixed(2),
          volume: (bar.volume / adjRatio).toFixed(2),
          date: bar.date,
          symbol: bar.symbol
        };
      })
    });
  }

  getMarketData() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.dataFile, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }
}

module.exports = Backtest;
