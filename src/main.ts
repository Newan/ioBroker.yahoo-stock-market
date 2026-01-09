/*
 * ioBroker.yahoo-stock-market Adapter
 * Aktualisiert für yahoo-finance2 v3 API
 * 
 * Hauptdatei: main.ts
 */

import * as utils from '@iobroker/adapter-core';
import YahooFinanceModule from 'yahoo-finance2';

// Erstelle Yahoo Finance Instanz (erforderlich für v3)
const yahooFinance = new YahooFinanceModule();

interface StockConfig {
    symbol: string;
    name: string;
}

// Yahoo Finance Quote Interface (vereinfacht)
interface YahooQuote {
    symbol?: string;
    regularMarketPrice?: number;
    currency?: string;
    regularMarketChange?: number;
    regularMarketChangePercent?: number;
    regularMarketOpen?: number;
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
    regularMarketVolume?: number;
    marketCap?: number;
    fiftyTwoWeekHigh?: number;
    fiftyTwoWeekLow?: number;
    marketState?: string;
    displayName?: string;
    longName?: string;
    shortName?: string;
}

// Erweitere die ioBroker AdapterConfig mit unseren Einstellungen
declare global {
    namespace ioBroker {
        interface AdapterConfig {
            stocks: StockConfig[];
            updateInterval: number;
        }
    }
}

class YahooStockMarket extends utils.Adapter {
    private updateInterval?: ioBroker.Interval;
    private stocks: StockConfig[] = [];

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'yahoo-stock-market',
        });

        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Wird aufgerufen, wenn der Adapter gestartet wird
     */
    private async onReady(): Promise<void> {
        this.log.info('Yahoo Stock Market Adapter gestartet (yahoo-finance2 v3)');

        // Konfiguration auslesen - unterstützt beide Formate (alt und neu)
        const configAny = this.config as any;
        
        // Altes Format: symbols (Array von Strings)
        if (configAny.symbols && Array.isArray(configAny.symbols)) {
            this.stocks = configAny.symbols.map((symbol: string) => ({
                symbol: symbol,
                name: symbol
            }));
        } 
        // Neues Format: stocks (Array von Objekten)
        else if (this.config.stocks && Array.isArray(this.config.stocks)) {
            this.stocks = this.config.stocks;
        }
        
        const updateIntervalMinutes = configAny.interval || this.config.updateInterval || 15;

        if (this.stocks.length === 0) {
            this.log.warn('Keine Aktien konfiguriert! Bitte füge Aktien in der Adapter-Konfiguration hinzu.');
            return;
        }

        this.log.info(`${this.stocks.length} Aktien konfiguriert, Update-Intervall: ${updateIntervalMinutes} Minuten`);

        // Erstelle Objekte für alle Aktien
        await this.createStockObjects();

        // Erste Abfrage sofort durchführen
        await this.updateAllStocks();

        // Regelmäßige Updates einrichten
        this.updateInterval = this.setInterval(
            () => this.updateAllStocks(),
            updateIntervalMinutes * 60 * 1000
        );
    }

    /**
     * Erstellt die ioBroker-Objekte für alle konfigurierten Aktien
     */
    private async createStockObjects(): Promise<void> {
        for (const stock of this.stocks) {
            const symbol = this.sanitizeSymbol(stock.symbol);
            
            // Hauptobjekt für die Aktie
            await this.setObjectNotExistsAsync(symbol, {
                type: 'channel',
                common: {
                    name: stock.name || stock.symbol,
                },
                native: {},
            });

            // Datenpunkte erstellen
            const dataPoints = [
                { id: 'regularMarketPrice', name: 'Aktueller Kurs', type: 'number' as const, role: 'value', unit: '' },
                { id: 'currency', name: 'Währung', type: 'string' as const, role: 'text', unit: '' },
                { id: 'regularMarketChange', name: 'Änderung', type: 'number' as const, role: 'value', unit: '' },
                { id: 'regularMarketChangePercent', name: 'Änderung %', type: 'number' as const, role: 'value', unit: '%' },
                { id: 'regularMarketOpen', name: 'Eröffnungskurs', type: 'number' as const, role: 'value', unit: '' },
                { id: 'regularMarketDayHigh', name: 'Tageshoch', type: 'number' as const, role: 'value', unit: '' },
                { id: 'regularMarketDayLow', name: 'Tagestief', type: 'number' as const, role: 'value', unit: '' },
                { id: 'regularMarketVolume', name: 'Volumen', type: 'number' as const, role: 'value', unit: '' },
                { id: 'marketCap', name: 'Marktkapitalisierung', type: 'number' as const, role: 'value', unit: '' },
                { id: 'fiftyTwoWeekHigh', name: '52-Wochen-Hoch', type: 'number' as const, role: 'value', unit: '' },
                { id: 'fiftyTwoWeekLow', name: '52-Wochen-Tief', type: 'number' as const, role: 'value', unit: '' },
                { id: 'marketState', name: 'Marktstatus', type: 'string' as const, role: 'text', unit: '' },
                { id: 'displayName', name: 'Vollständiger Name', type: 'string' as const, role: 'text', unit: '' },
                { id: 'lastUpdate', name: 'Letzte Aktualisierung', type: 'string' as const, role: 'text', unit: '' },
            ];

            for (const dp of dataPoints) {
                await this.setObjectNotExistsAsync(`${symbol}.${dp.id}`, {
                    type: 'state',
                    common: {
                        name: dp.name,
                        type: dp.type,
                        role: dp.role,
                        read: true,
                        write: false,
                        unit: dp.unit,
                    },
                    native: {},
                });
            }
        }
    }

    /**
     * Aktualisiert die Daten für alle konfigurierten Aktien
     */
    private async updateAllStocks(): Promise<void> {
        this.log.debug('Starte Update für alle Aktien...');

        for (const stock of this.stocks) {
            try {
                await this.updateStock(stock);
            } catch (error) {
                this.log.error(`Fehler beim Update für ${stock.symbol}: ${error}`);
            }
        }
    }

    /**
     * Aktualisiert die Daten für eine einzelne Aktie
     */
    private async updateStock(stock: StockConfig): Promise<void> {
        const symbol = this.sanitizeSymbol(stock.symbol);
        
        try {
            this.log.debug(`Rufe Daten für ${stock.symbol} ab...`);
            
            // Verwendung der yahoo-finance2 v3 API
            const quote = await yahooFinance.quote(stock.symbol) as YahooQuote;
            
            if (!quote) {
                this.log.warn(`Keine Daten für ${stock.symbol} erhalten`);
                return;
            }

            this.log.debug(`Daten für ${stock.symbol} erfolgreich abgerufen`);

            // Daten in ioBroker-States schreiben
            const updates: Array<{id: string, value: string | number | undefined}> = [
                { id: 'regularMarketPrice', value: quote.regularMarketPrice },
                { id: 'currency', value: quote.currency },
                { id: 'regularMarketChange', value: quote.regularMarketChange },
                { id: 'regularMarketChangePercent', value: quote.regularMarketChangePercent },
                { id: 'regularMarketOpen', value: quote.regularMarketOpen },
                { id: 'regularMarketDayHigh', value: quote.regularMarketDayHigh },
                { id: 'regularMarketDayLow', value: quote.regularMarketDayLow },
                { id: 'regularMarketVolume', value: quote.regularMarketVolume },
                { id: 'marketCap', value: quote.marketCap },
                { id: 'fiftyTwoWeekHigh', value: quote.fiftyTwoWeekHigh },
                { id: 'fiftyTwoWeekLow', value: quote.fiftyTwoWeekLow },
                { id: 'marketState', value: quote.marketState },
                { id: 'displayName', value: quote.displayName || quote.longName || quote.shortName },
                { id: 'lastUpdate', value: new Date().toISOString() },
            ];

            for (const update of updates) {
                if (update.value !== undefined && update.value !== null) {
                    await this.setStateAsync(`${symbol}.${update.id}`, update.value, true);
                }
            }

            this.log.info(`${stock.symbol}: ${quote.regularMarketPrice ?? 'N/A'} ${quote.currency ?? ''}`);

        } catch (error: unknown) {
            // Fehlerbehandlung für yahoo-finance2 v3
            const err = error as Error;
            if (err.name === 'FailedYahooValidationError') {
                this.log.error(`Validierungsfehler für ${stock.symbol}: ${err.message}`);
            } else if (err.name === 'HTTPError') {
                this.log.error(`HTTP-Fehler für ${stock.symbol}: ${err.message}`);
            } else {
                this.log.error(`Fehler beim API-Aufruf für ${stock.symbol}: ${err.message || err}`);
            }
            throw error;
        }
    }

    /**
     * Bereinigt das Symbol für die Verwendung als Objekt-ID
     */
    private sanitizeSymbol(symbol: string): string {
        return symbol.replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    /**
     * Wird aufgerufen, wenn der Adapter beendet wird
     */
    private onUnload(callback: () => void): void {
        try {
            if (this.updateInterval) {
                this.clearInterval(this.updateInterval);
            }
            this.log.info('Yahoo Stock Market Adapter beendet');
            callback();
        } catch (e) {
            callback();
        }
    }
}

if (require.main !== module) {
    // Export für ioBroker
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new YahooStockMarket(options);
} else {
    // Direkter Start für Tests
    (() => new YahooStockMarket())();
}