'use strict';
const Backtest = require('./backtest');

const bt = new Backtest(
  1000,
  [
    'SAR'
  ],
  new Date('1-1-2015'),
  new Date('1-1-2016')
);
