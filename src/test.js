'use strict';
const Backtest = require('./backtest');

const bt = new Backtest(
  1000,
  [
    'SAR',
    'SMA'
  ],
  new Date('1-1-2015'),
  new Date('1-1-2016')
);

bt.setTradingLogic(obj => {
  console.log(obj.symbols.SPY.indicators);
});
