'use strict';

const fs = require('fs');
const talib = require('talib');

class LiveAlgo {
  constructor({
    symbols,
    indicators,
    lookBackPeriod
  }) {
    this.symbols = symbols;
    this.indicators = indicators;
    this.lookBackPeriod = lookBackPeriod;
  }

  setTradingLogic(tradingLogic) {
    this.tradingLogic = tradingLogic;
    this.main();
  }

  backtestLoop(data) {
    for (let bar of data) {
      console.log(bar);
    }
  }

  async main() {
    try {
      const dateRange = this.getDateRange();
      const baseMarketData = await this.getHistoricalData(dateRange);
      // calculate ta indicators
      this.backtestLoop(finalMarketData);
    } catch (error) {
      console.error(error);
    }
  }

  formatDate(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  getDateRange() {
    const currentDate = new Date();
    return {
      startDate: currentDate,
      endDate: new Date().setDate(currentDate.getDate() - this.lookBackPeriod)
    };
  }

  getHistoricalData({ startDate, endDate }) {
    return yahooFinance.historical({
      symbols: this.symbols,
      from: this.formatDate(startDate),
      to: this.formatDate(endDate)
    });
  }
}

module.exports = LiveAlgo;
