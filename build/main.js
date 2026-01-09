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
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_yahoo_finance2 = __toESM(require("yahoo-finance2"));
const yahooFinance = new import_yahoo_finance2.default();
class YahooStockMarket extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "yahoo-stock-market"
    });
    this.stocks = [];
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  /**
   * Wird aufgerufen, wenn der Adapter gestartet wird
   */
  async onReady() {
    this.log.info("Yahoo Stock Market Adapter gestartet (yahoo-finance2 v3)");
    const configAny = this.config;
    if (configAny.symbols && Array.isArray(configAny.symbols)) {
      this.stocks = configAny.symbols.map((symbol) => ({
        symbol,
        name: symbol
      }));
    } else if (this.config.stocks && Array.isArray(this.config.stocks)) {
      this.stocks = this.config.stocks;
    }
    const updateIntervalMinutes = configAny.interval || this.config.updateInterval || 15;
    if (this.stocks.length === 0) {
      this.log.warn("Keine Aktien konfiguriert! Bitte f\xFCge Aktien in der Adapter-Konfiguration hinzu.");
      return;
    }
    this.log.info(`${this.stocks.length} Aktien konfiguriert, Update-Intervall: ${updateIntervalMinutes} Minuten`);
    await this.createStockObjects();
    await this.updateAllStocks();
    this.updateInterval = this.setInterval(
      () => this.updateAllStocks(),
      updateIntervalMinutes * 60 * 1e3
    );
  }
  /**
   * Erstellt die ioBroker-Objekte für alle konfigurierten Aktien
   */
  async createStockObjects() {
    for (const stock of this.stocks) {
      const symbol = this.sanitizeSymbol(stock.symbol);
      await this.setObjectNotExistsAsync(symbol, {
        type: "channel",
        common: {
          name: stock.name || stock.symbol
        },
        native: {}
      });
      const dataPoints = [
        { id: "regularMarketPrice", name: "Aktueller Kurs", type: "number", role: "value", unit: "" },
        { id: "currency", name: "W\xE4hrung", type: "string", role: "text", unit: "" },
        { id: "regularMarketChange", name: "\xC4nderung", type: "number", role: "value", unit: "" },
        { id: "regularMarketChangePercent", name: "\xC4nderung %", type: "number", role: "value", unit: "%" },
        { id: "regularMarketOpen", name: "Er\xF6ffnungskurs", type: "number", role: "value", unit: "" },
        { id: "regularMarketDayHigh", name: "Tageshoch", type: "number", role: "value", unit: "" },
        { id: "regularMarketDayLow", name: "Tagestief", type: "number", role: "value", unit: "" },
        { id: "regularMarketVolume", name: "Volumen", type: "number", role: "value", unit: "" },
        { id: "marketCap", name: "Marktkapitalisierung", type: "number", role: "value", unit: "" },
        { id: "fiftyTwoWeekHigh", name: "52-Wochen-Hoch", type: "number", role: "value", unit: "" },
        { id: "fiftyTwoWeekLow", name: "52-Wochen-Tief", type: "number", role: "value", unit: "" },
        { id: "marketState", name: "Marktstatus", type: "string", role: "text", unit: "" },
        { id: "displayName", name: "Vollst\xE4ndiger Name", type: "string", role: "text", unit: "" },
        { id: "lastUpdate", name: "Letzte Aktualisierung", type: "string", role: "text", unit: "" }
      ];
      for (const dp of dataPoints) {
        await this.setObjectNotExistsAsync(`${symbol}.${dp.id}`, {
          type: "state",
          common: {
            name: dp.name,
            type: dp.type,
            role: dp.role,
            read: true,
            write: false,
            unit: dp.unit
          },
          native: {}
        });
      }
    }
  }
  /**
   * Aktualisiert die Daten für alle konfigurierten Aktien
   */
  async updateAllStocks() {
    this.log.debug("Starte Update f\xFCr alle Aktien...");
    for (const stock of this.stocks) {
      try {
        await this.updateStock(stock);
      } catch (error) {
        this.log.error(`Fehler beim Update f\xFCr ${stock.symbol}: ${error}`);
      }
    }
  }
  /**
   * Aktualisiert die Daten für eine einzelne Aktie
   */
  async updateStock(stock) {
    var _a, _b;
    const symbol = this.sanitizeSymbol(stock.symbol);
    try {
      this.log.debug(`Rufe Daten f\xFCr ${stock.symbol} ab...`);
      const quote = await yahooFinance.quote(stock.symbol);
      if (!quote) {
        this.log.warn(`Keine Daten f\xFCr ${stock.symbol} erhalten`);
        return;
      }
      this.log.debug(`Daten f\xFCr ${stock.symbol} erfolgreich abgerufen`);
      const updates = [
        { id: "regularMarketPrice", value: quote.regularMarketPrice },
        { id: "currency", value: quote.currency },
        { id: "regularMarketChange", value: quote.regularMarketChange },
        { id: "regularMarketChangePercent", value: quote.regularMarketChangePercent },
        { id: "regularMarketOpen", value: quote.regularMarketOpen },
        { id: "regularMarketDayHigh", value: quote.regularMarketDayHigh },
        { id: "regularMarketDayLow", value: quote.regularMarketDayLow },
        { id: "regularMarketVolume", value: quote.regularMarketVolume },
        { id: "marketCap", value: quote.marketCap },
        { id: "fiftyTwoWeekHigh", value: quote.fiftyTwoWeekHigh },
        { id: "fiftyTwoWeekLow", value: quote.fiftyTwoWeekLow },
        { id: "marketState", value: quote.marketState },
        { id: "displayName", value: quote.displayName || quote.longName || quote.shortName },
        { id: "lastUpdate", value: (/* @__PURE__ */ new Date()).toISOString() }
      ];
      for (const update of updates) {
        if (update.value !== void 0 && update.value !== null) {
          await this.setStateAsync(`${symbol}.${update.id}`, update.value, true);
        }
      }
      this.log.info(`${stock.symbol}: ${(_a = quote.regularMarketPrice) != null ? _a : "N/A"} ${(_b = quote.currency) != null ? _b : ""}`);
    } catch (error) {
      const err = error;
      if (err.name === "FailedYahooValidationError") {
        this.log.error(`Validierungsfehler f\xFCr ${stock.symbol}: ${err.message}`);
      } else if (err.name === "HTTPError") {
        this.log.error(`HTTP-Fehler f\xFCr ${stock.symbol}: ${err.message}`);
      } else {
        this.log.error(`Fehler beim API-Aufruf f\xFCr ${stock.symbol}: ${err.message || err}`);
      }
      throw error;
    }
  }
  /**
   * Bereinigt das Symbol für die Verwendung als Objekt-ID
   */
  sanitizeSymbol(symbol) {
    return symbol.replace(/[^a-zA-Z0-9_-]/g, "_");
  }
  /**
   * Wird aufgerufen, wenn der Adapter beendet wird
   */
  onUnload(callback) {
    try {
      if (this.updateInterval) {
        this.clearInterval(this.updateInterval);
      }
      this.log.info("Yahoo Stock Market Adapter beendet");
      callback();
    } catch (e) {
      callback();
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new YahooStockMarket(options);
} else {
  (() => new YahooStockMarket())();
}
//# sourceMappingURL=main.js.map
