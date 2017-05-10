'use strict';

const fs = require('fs');

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
    this.dataFile = `${__dirname}/../data/historical-data.json`;
    this.capital = capital;
    this.indicators = indicators;
    this.startDate = Backtest.validateDate(startDate);
    this.endDate = Backtest.validateDate(endDate);
    Backtest.validateDateRange(this.startDate, this.endDate);
    this.main();
  }

  async main() {
    try {
      const dates = this.generateDates();
      const baseMarketData = await this.getMarketData();
      const backtestData = formatBacktestData(dates, baseMarketData);
    } catch(err) {
      console.error(err);
    }
  }

  formatBacktestData(dates, marketData) {
    dates.map(date => {
      return {
        date: date,
        bars: {
          AAPL: {
            date: '2000-05-22T04:00:00.000Z',
            open: 5.1875,
            high: 5.1875,
            low: 4.5625,
            close: 5,
            volume: 1550800,
            adjClose: 4.452268,
            symbol: 'WDC'
          },
          WDC: {
            date: '2000-05-22T04:00:00.000Z',
            open: 5.1875,
            high: 5.1875,
            low: 4.5625,
            close: 5,
            volume: 1550800,
            adjClose: 4.452268,
            symbol: 'WDC'
          }
        }
      };
    });
  }

  nextDate(date) {
    return new Date(date.setDate(date.getDate() + 1));
  }

  generateDates() {
    const dates = [];
    let currentDate = this.startDate;
    while(currentDate <= this.endDate) {
      dates.push(currentDate);
      currentDate = this.nextDate(currentDate);
    }
    return dates;
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
