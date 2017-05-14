'use strict';

const fs = require('fs');
const talib = require('talib');

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
      const marketData = await this.buildMarketData();
    } catch (error) {
      console.error(error);
    }
  }

  async buildMarketData() {
    try {
      const baseMarketData = await this.getMarketData();
      // adjust historical data (baseMarketData)
      const adjMarketData = this.adjustHistoricalData(baseMarketData);
      // build talib market data inputs (special shape)
      const taMarketData = await this.buildTaIndicators(adjMarketData);
      // condense taMarketData and marketData
      const condensedData = this.condenseData(adjMarketData, taMarketData);
      // build backtest data
      const backtestData = this.buildBacktestShape(condensedData);
      return backtestData;
    } catch (error) {
      console.error(error);
    }
  }

  async buildTaIndicators(data) {
    try {
      const result = {};
      for (let symbol in data) {
        const taInputs = await this.formatTaInputs(data[symbol]);
        const presets = this.generatePresets(taInputs);
        const resultPromises = presets.map(preset => this.talibExecute(preset));
        const taData = await Promise.all(resultPromises);
        result[symbol] = taData;
      }
      return result;
    } catch (error) {
      console.error(error);
    }
  }

  buildBacktestShape(data) {
    const dates = data.SPY.map(bar => bar.date);
    return dates.map(date => {
      const resultData = {};
      for (let symbol in data) {
        const index = data[symbol].findIndex(bar => bar.date === date);
        if (index !== -1) resultData[symbol] = data[symbol][index];
      }
      return {
        date: date,
        symbols: resultData
      }
    });
  }

  condenseData(marketData, taMarketData) {
    const result = {};
    for (let symbol in marketData) {
      result[symbol] = marketData[symbol].map((bar, index) => {
        bar.indicators = {};
        taMarketData[symbol].map((indicator, taIndex) => {
          if (indicator.begIndex <= index) {
            bar.indicators[this.indicators[taIndex]] = indicator.result.outReal[index];
          }
        });
        return bar;
      });
    }
    return result;
  }

  generatePresets(taInputs) {
    return this.indicators.map(indicator => {
      const def = talib.explain(indicator);
      const returnObj = {
        name: def.name,
        startIdx: 0,
        endIdx: taInputs.close.length - 1,
        open: taInputs.open,
        high: taInputs.high,
        low: taInputs.low,
        close: taInputs.close,
        inReal: taInputs.close
      };
      for (let input of def.optInputs) {
        returnObj[input.name] = input.defaultValue;
      }
      return returnObj;
    });
  }

  formatTaInputs(data) {
    const result = {
      open: [],
      high: [],
      low: [],
      close: [],
      volume: []
    };
    for (let bar of data) {
      result.open.push(bar.open);
      result.high.push(bar.high);
      result.low.push(bar.low);
      result.close.push(bar.close);
      result.volume.push(bar.volume);
    }
    return result;
  }

  talibExecute(preset) {
    return new Promise((resolve, reject) => {
      talib.execute(preset, (result, err) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  adjustHistoricalData(data) {
    const result = {};
    for (let symbol in data) {
      result[symbol] = data[symbol].map(bar => {
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
      });
    }
    return result;
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
