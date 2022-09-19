/*
 * Created with @iobroker/create-adapter v2.2.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import yahooFinance from 'yahoo-finance2';

class StockMarket extends utils.Adapter {


    private myInterval: any;
    private interval = 0;
    private symbols = [];


    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'yahoo-stock-market',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        this.log.info('initialize yahoo-stock-market adapter');


        this.symbols = this.config.symbols;
        if(this.symbols.length <= 0 || this.symbols == undefined) {
            this.log.error('No stock symbols set. Please edit your adapter settings and restart this adapter!');
            return;
        }

        this.interval = this.config.interval;
        if(this.interval  <= 0) {
            this.log.error('No interval set. Please edit your adapter settings and restart this adapter!');
            return;
        }

        //initial call
        this.readStockMarket();

        //start Interval
        this.myInterval =  this.setInterval(() => this.readStockMarket(), (this.interval * 60) * 1000);
    }

    private readStockMarket(): void {

        this.log.debug('stocks to check: ' + this.symbols);

        //For each symbol ask API
        this.symbols.forEach( symbol => {
            yahooFinance.quoteSummary(symbol, {
                // 1. Try adding, removing or changing modules
                // You'll get suggestions after typing first quote mark (")
                modules: ['price']
            }).then( result => {
                this.setNewStockObjects(symbol, result);
                this.log.debug("Api return: '" + JSON.stringify(result) + "'");

                this.log.debug('stocks to check: ' + this.config.symbols);
            }).catch(err => {
                this.log.error('Error on APi Call for symbol: ' + symbol);
                this.log.error(err.toString());
            });
        });
    }

    async setNewStockObjects(symbol: string, apiResult: any): Promise<void> {
        //Dot ion symbol brokes with iobroker
        symbol = symbol.replace('.', ':');

        //shortname
        await this.setObjectNotExistsAsync(symbol + '.shortName', {
            type: 'state',
            common: {
                name: 'shortName',
                role: 'info',
                type: 'string',
                write: false,
                read: true,
            },
            native: {},
        }).catch((error) => {
            this.log.error(error);
        });
        await this.setStateAsync(symbol + '.shortName', apiResult.price.shortName, true);

        //longName
        await this.setObjectNotExistsAsync(symbol + '.longName', {
            type: 'state',
            common: {
                name: 'longName',
                role: 'info',
                type: 'string',
                write: false,
                read: true,
            },
            native: {},
        }).catch((error) => {
            this.log.error(error);
        });
        await this.setStateAsync(symbol + '.longName', apiResult.price.longName, true);

        //currency
        await this.setObjectNotExistsAsync(symbol + '.currency', {
            type: 'state',
            common: {
                name: 'currency',
                role: 'info',
                type: 'string',
                write: false,
                read: true,
            },
            native: {},
        }).catch((error) => {
            this.log.error(error);
        });
        await this.setStateAsync(symbol + '.currency', apiResult.price.currency, true);

        //exchangeName
        await this.setObjectNotExistsAsync(symbol + '.exchangeName', {
            type: 'state',
            common: {
                name: 'exchangeName',
                role: 'info',
                type: 'string',
                write: false,
                read: true,
            },
            native: {},
        }).catch((error) => {
            this.log.error(error);
        });
        await this.setStateAsync(symbol + '.exchangeName', apiResult.price.exchangeName, true);

        //regularMarketOpen
        await this.setObjectNotExistsAsync(symbol + '.regularMarketOpen', {
            type: 'state',
            common: {
                name: 'regularMarketOpen',
                role: 'value',
                type: 'number',
                write: false,
                read: true,
            },
            native: {},
        }).catch((error) => {
            this.log.error(error);
        });
        await this.setStateAsync(symbol + '.regularMarketOpen', parseFloat(apiResult.price.regularMarketOpen), true);

        //regularMarketPreviousClose
        await this.setObjectNotExistsAsync(symbol + '.regularMarketPreviousClose', {
            type: 'state',
            common: {
                name: 'regularMarketPreviousClose',
                role: 'value',
                type: 'number',
                write: false,
                read: true,
            },
            native: {},
        }).catch((error) => {
            this.log.error(error);
        });
        await this.setStateAsync(symbol + '.regularMarketPreviousClose', parseFloat(apiResult.price.regularMarketPreviousClose), true);

        //regularMarketPreviousClose
        await this.setObjectNotExistsAsync(symbol + '.regularMarketPreviousClose', {
            type: 'state',
            common: {
                name: 'regularMarketPreviousClose',
                role: 'value',
                type: 'number',
                write: false,
                read: true,
            },
            native: {},
        }).catch((error) => {
            this.log.error(error);
        });
        await this.setStateAsync(symbol + '.regularMarketPreviousClose', parseFloat(apiResult.price.regularMarketPreviousClose), true);

        //regularMarketVolume
        await this.setObjectNotExistsAsync(symbol + '.regularMarketVolume', {
            type: 'state',
            common: {
                name: 'regularMarketVolume',
                role: 'value',
                type: 'number',
                write: false,
                read: true,
            },
            native: {},
        }).catch((error) => {
            this.log.error(error);
        });
        await this.setStateAsync(symbol + '.regularMarketVolume', parseInt(apiResult.price.regularMarketVolume), true);

        //regularMarketDayLow
        await this.setObjectNotExistsAsync(symbol + '.regularMarketDayLow', {
            type: 'state',
            common: {
                name: 'regularMarketDayLow',
                role: 'value',
                type: 'number',
                write: false,
                read: true,
            },
            native: {},
        }).catch((error) => {
            this.log.error(error);
        });
        await this.setStateAsync(symbol + '.regularMarketDayLow', parseFloat(apiResult.price.regularMarketDayLow), true);

        //regularMarketDayHigh
        await this.setObjectNotExistsAsync(symbol + '.regularMarketDayHigh', {
            type: 'state',
            common: {
                name: 'regularMarketDayHigh',
                role: 'value',
                type: 'number',
                write: false,
                read: true,
            },
            native: {},
        }).catch((error) => {
            this.log.error(error);
        });
        await this.setStateAsync(symbol + '.regularMarketDayHigh', parseFloat(apiResult.price.regularMarketDayHigh), true);

        //regularMarketPrice
        await this.setObjectNotExistsAsync(symbol + '.regularMarketPrice', {
            type: 'state',
            common: {
                name: 'regularMarketPrice',
                role: 'value',
                type: 'number',
                write: false,
                read: true,
            },
            native: {},
        }).catch((error) => {
            this.log.error(error);
        });
        await this.setStateAsync(symbol + '.regularMarketPrice', parseFloat(apiResult.price.regularMarketPrice), true);

        //regularMarketChange
        await this.setObjectNotExistsAsync(symbol + '.regularMarketChange', {
            type: 'state',
            common: {
                name: 'regularMarketChange',
                role: 'value',
                type: 'number',
                write: false,
                read: true,
            },
            native: {},
        }).catch((error) => {
            this.log.error(error);
        });
        await this.setStateAsync(symbol + '.regularMarketChange', parseFloat(apiResult.price.regularMarketChange), true);

        //regularMarketChangePercent
        await this.setObjectNotExistsAsync(symbol + '.regularMarketChangePercent', {
            type: 'state',
            common: {
                name: 'regularMarketChangePercent',
                role: 'value',
                type: 'number',
                write: false,
                read: true,
            },
            native: {},
        }).catch((error) => {
            this.log.error(error);
        });
        await this.setStateAsync(symbol + '.regularMarketChangePercent', parseFloat(apiResult.price.regularMarketChangePercent) * 100, true);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            clearTimeout(this.myInterval);

            callback();
        } catch (e) {
            callback();
        }
    }

    private async deleteOldObject(stockKey: string, index: number): Promise<void> {
        const delObject = await this.getObjectAsync(stockKey + '.' + index + '.close')

        if (delObject) {
            this.log.debug('Found old Objects for key - ' + stockKey +' and index - ' + index.toString());
            await this.delObjectAsync(stockKey + '.' + index, {recursive:true});
            // Have one delted, next round
            await this.deleteOldObject(stockKey, index+1);
        }
    }

}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new StockMarket(options);
} else {
    // otherwise start the instance directly
    (() => new StockMarket())();
}