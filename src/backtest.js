'use strict';

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
    this.dateFile = `${__dirname}/../data/historical-data.json`;
    this.capital = capital;
    this.indicators = indicators;
    this.startDate = Backtest.validateDate(startDate);
    this.endDate = Backtest.validateDate(endDate);
    Backtest.validateDateRange(this.startDate, this.endDate);
    this.main();
  }

  async main() {
    try {
      const backtestData = this.generateDates();
      console.log(backtestData);
      // const baseMarketData = await this.getMarketData();
    } catch(err) {
      console.error(err);
    }
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
