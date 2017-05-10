'use strict';

class Backtest {
  constructor(
    capital,
    stocks,
    indicators,
    startDate,
    endDate
  ) {
    this.capital = capital;
    this.stocks = stocks;
    this.indicators = indicators;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

module.exports = Backtest;
