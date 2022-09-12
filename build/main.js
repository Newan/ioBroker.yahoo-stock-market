"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_yahoo_finance2 = __toESM(require("yahoo-finance2"));
class StockMarket extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "stock-market"
    });
    this.interval = 0;
    this.symbols = "";
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    this.log.info("initialize Stock-Market adapter");
    this.symbols = this.config.symbols;
    if (this.symbols == "" || this.symbols == void 0) {
      this.log.error("No stock symbols set. Please edit your adapter settings and restart this adapter!");
      return;
    }
    this.interval = this.config.interval;
    if (this.interval <= 0) {
      this.log.error("No interval set. Please edit your adapter settings and restart this adapter!");
      return;
    }
    await this.readStockMarket();
  }
  async readStockMarket() {
    this.log.debug("stocks to check: " + this.symbols);
    let result;
    this.symbols.split(",").forEach(async (symbol) => {
      try {
        result = await import_yahoo_finance2.default.quoteSummary(symbol, {
          modules: ["price"]
        });
        await this.setNewStockObjects(symbol, result);
        this.log.debug("Api return: '" + JSON.stringify(result) + "'");
        this.log.debug("stocks to check: " + this.config.symbols);
      } catch (e) {
        this.log.error("Error on APi Call for symbol: " + symbol);
        this.log.error(e.toString());
      }
    });
    this.myInterval = await new Promise((resolve) => setTimeout(resolve, this.interval * 60 * 1e3));
  }
  async setNewStockObjects(symbol, apiResult) {
    symbol = symbol.replace(".", ":");
    await this.setObjectNotExistsAsync(symbol + ".shortName", {
      type: "state",
      common: {
        name: "shortName",
        role: "info",
        type: "string",
        write: false,
        read: true
      },
      native: {}
    }).catch((error) => {
      this.log.error(error);
    });
    await this.setStateAsync(symbol + ".shortName", apiResult.price.shortName, true);
    await this.setObjectNotExistsAsync(symbol + ".longName", {
      type: "state",
      common: {
        name: "longName",
        role: "info",
        type: "string",
        write: false,
        read: true
      },
      native: {}
    }).catch((error) => {
      this.log.error(error);
    });
    await this.setStateAsync(symbol + ".longName", apiResult.price.longName, true);
    await this.setObjectNotExistsAsync(symbol + ".currency", {
      type: "state",
      common: {
        name: "currency",
        role: "info",
        type: "string",
        write: false,
        read: true
      },
      native: {}
    }).catch((error) => {
      this.log.error(error);
    });
    await this.setStateAsync(symbol + ".currency", apiResult.price.currency, true);
    await this.setObjectNotExistsAsync(symbol + ".exchangeName", {
      type: "state",
      common: {
        name: "exchangeName",
        role: "info",
        type: "string",
        write: false,
        read: true
      },
      native: {}
    }).catch((error) => {
      this.log.error(error);
    });
    await this.setStateAsync(symbol + ".exchangeName", apiResult.price.exchangeName, true);
    await this.setObjectNotExistsAsync(symbol + ".regularMarketOpen", {
      type: "state",
      common: {
        name: "regularMarketOpen",
        role: "value",
        type: "number",
        write: false,
        read: true
      },
      native: {}
    }).catch((error) => {
      this.log.error(error);
    });
    await this.setStateAsync(symbol + ".regularMarketOpen", parseFloat(apiResult.price.regularMarketOpen), true);
    await this.setObjectNotExistsAsync(symbol + ".regularMarketPreviousClose", {
      type: "state",
      common: {
        name: "regularMarketPreviousClose",
        role: "value",
        type: "number",
        write: false,
        read: true
      },
      native: {}
    }).catch((error) => {
      this.log.error(error);
    });
    await this.setStateAsync(symbol + ".regularMarketPreviousClose", parseFloat(apiResult.price.regularMarketPreviousClose), true);
    await this.setObjectNotExistsAsync(symbol + ".regularMarketPreviousClose", {
      type: "state",
      common: {
        name: "regularMarketPreviousClose",
        role: "value",
        type: "number",
        write: false,
        read: true
      },
      native: {}
    }).catch((error) => {
      this.log.error(error);
    });
    await this.setStateAsync(symbol + ".regularMarketPreviousClose", parseFloat(apiResult.price.regularMarketPreviousClose), true);
    await this.setObjectNotExistsAsync(symbol + ".regularMarketVolume", {
      type: "state",
      common: {
        name: "regularMarketVolume",
        role: "value",
        type: "number",
        write: false,
        read: true
      },
      native: {}
    }).catch((error) => {
      this.log.error(error);
    });
    await this.setStateAsync(symbol + ".regularMarketVolume", parseInt(apiResult.price.regularMarketVolume), true);
    await this.setObjectNotExistsAsync(symbol + ".regularMarketDayLow", {
      type: "state",
      common: {
        name: "regularMarketDayLow",
        role: "value",
        type: "number",
        write: false,
        read: true
      },
      native: {}
    }).catch((error) => {
      this.log.error(error);
    });
    await this.setStateAsync(symbol + ".regularMarketDayLow", parseFloat(apiResult.price.regularMarketDayLow), true);
    await this.setObjectNotExistsAsync(symbol + ".regularMarketDayHigh", {
      type: "state",
      common: {
        name: "regularMarketDayHigh",
        role: "value",
        type: "number",
        write: false,
        read: true
      },
      native: {}
    }).catch((error) => {
      this.log.error(error);
    });
    await this.setStateAsync(symbol + ".regularMarketDayHigh", parseFloat(apiResult.price.regularMarketDayHigh), true);
    await this.setObjectNotExistsAsync(symbol + ".regularMarketPrice", {
      type: "state",
      common: {
        name: "regularMarketPrice",
        role: "value",
        type: "number",
        write: false,
        read: true
      },
      native: {}
    }).catch((error) => {
      this.log.error(error);
    });
    await this.setStateAsync(symbol + ".regularMarketPrice", parseFloat(apiResult.price.regularMarketPrice), true);
    await this.setObjectNotExistsAsync(symbol + ".regularMarketChange", {
      type: "state",
      common: {
        name: "regularMarketChange",
        role: "value",
        type: "number",
        write: false,
        read: true
      },
      native: {}
    }).catch((error) => {
      this.log.error(error);
    });
    await this.setStateAsync(symbol + ".regularMarketChange", parseFloat(apiResult.price.regularMarketChange), true);
    await this.setObjectNotExistsAsync(symbol + ".regularMarketChangePercent", {
      type: "state",
      common: {
        name: "regularMarketChangePercent",
        role: "value",
        type: "number",
        write: false,
        read: true
      },
      native: {}
    }).catch((error) => {
      this.log.error(error);
    });
    await this.setStateAsync(symbol + ".regularMarketChangePercent", parseFloat(apiResult.price.regularMarketChangePercent) * 100, true);
  }
  onUnload(callback) {
    try {
      clearInterval(this.myInterval);
      callback();
    } catch (e) {
      callback();
    }
  }
  async deleteOldObject(stockKey, index) {
    const delObject = await this.getObjectAsync(stockKey + "." + index + ".close");
    if (delObject) {
      this.log.debug("Found old Objects for key - " + stockKey + " and index - " + index.toString());
      await this.delObjectAsync(stockKey + "." + index, { recursive: true });
      await this.deleteOldObject(stockKey, index + 1);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new StockMarket(options);
} else {
  (() => new StockMarket())();
}
//# sourceMappingURL=main.js.map
