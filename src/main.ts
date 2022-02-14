/*
 * Created with @iobroker/create-adapter v2.0.2
 */

import * as utils from '@iobroker/adapter-core';
import axios from 'axios';

class StockMarket extends utils.Adapter {

    private base_url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=';
    private api_error = false;
    private myInterval: any;

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'stock-market',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        this.log.info('initialize StockMarket adapter');

        const apikey = this.config.api_key;
        if(apikey == '') {
            this.log.error('No API Key set. Please edit your adapter settings and restart this adapter!');
            return;
        }

        const interval = this.config.interval;
        if(interval  <= 0) {
            this.log.error('No interval set. Please edit your adapter settings and restart this adapter!');
            return;
        }

        //start Interval
        this.myInterval = setInterval(() => {
            this.log.debug('Start api callback:');
            this.readStockMarket(apikey);
        }, interval * 1000)
    }

    private readStockMarket(apikey: string): void {
        this.log.debug("Apikey found: '" + apikey + "'");

        this.log.debug('stocks to check: ' + this.config.stock);
        this.config.stock.split(',').forEach( async stockKey => {
            if(this.api_error) {
                this.log.warn('Skip ' + stockKey + ' api limit is reached!');
            } else {
                this.log.debug('stock key check: ' + stockKey);
                await axios(this.base_url + stockKey + '&interval=5min&apikey=' + apikey).then( async stock_data => {
                    this.log.debug('stock data found: ' + JSON.stringify(stock_data.data));
                    //check if api limit is rechaed
                    if(stock_data.data.hasOwnProperty('Note')) {
                        this.log.error(stock_data.data.Note);
                        this.api_error = true;
                    } else {

                        //lopp over Timeseries
                        let i = 0;
                        for( const timeseries in stock_data.data['Time Series (5min)']){
                            this.log.debug('Timeseries for: ' + stockKey + ' found: ' + timeseries);
                            this.log.debug(JSON.stringify(stock_data.data['Time Series (5min)'][timeseries]));

                            await this.setObjectNotExistsAsync(stockKey + '.' + i + '.time', {
                                type: 'state',
                                common: {
                                    name: 'time',
                                    role: 'value',
                                    type: 'string',
                                    write: false,
                                    read: true,
                                },
                                native: {},
                            }).catch((error) => {
                                this.log.error(error);
                            });
                            await this.setStateAsync(stockKey + '.' + i + '.time', timeseries, true);


                            await this.setObjectNotExistsAsync(stockKey + '.' + i + '.open', {
                                type: 'state',
                                common: {
                                    name: 'open',
                                    role: 'value',
                                    type: 'number',
                                    write: false,
                                    read: true,
                                },
                                native: {},
                            }).catch((error) => {
                                this.log.error(error);
                            });
                            await this.setStateAsync(stockKey + '.' + i + '.open', parseFloat(stock_data.data['Time Series (5min)'][timeseries]['1. open']), true);

                            await this.setObjectNotExistsAsync(stockKey + '.' + i + '.high', {
                                type: 'state',
                                common: {
                                    name: 'high',
                                    role: 'value',
                                    type: 'number',
                                    write: false,
                                    read: true,
                                },
                                native: {},
                            }).catch((error) => {
                                this.log.error(error);
                            });
                            await this.setStateAsync(stockKey + '.' + i + '.high', parseFloat(stock_data.data['Time Series (5min)'][timeseries]['2. high']), true);

                            await this.setObjectNotExistsAsync(stockKey + '.' + i + '.low', {
                                type: 'state',
                                common: {
                                    name: 'low',
                                    role: 'value',
                                    type: 'number',
                                    write: false,
                                    read: true,
                                },
                                native: {},
                            }).catch((error) => {
                                this.log.error(error);
                            });
                            await this.setStateAsync(stockKey + '.' + i + '.low', parseFloat(stock_data.data['Time Series (5min)'][timeseries]['3. low']), true);

                            await this.setObjectNotExistsAsync(stockKey + '.' + i + '.close', {
                                type: 'state',
                                common: {
                                    name: 'close',
                                    role: 'value',
                                    type: 'number',
                                    write: false,
                                    read: true,
                                },
                                native: {},
                            }).catch((error) => {
                                this.log.error(error);
                            });
                            await this.setStateAsync(stockKey + '.' + i + '.close', parseFloat(stock_data.data['Time Series (5min)'][timeseries]['4. close']), true);

                            await this.setObjectNotExistsAsync(stockKey + '.' + i + '.volume', {
                                type: 'state',
                                common: {
                                    name: 'volume',
                                    role: 'value',
                                    type: 'number',
                                    write: false,
                                    read: true,
                                },
                                native: {},
                            }).catch((error) => {
                                this.log.error(error);
                            });
                            await this.setStateAsync(stockKey + '.' + i + '.volume', parseFloat(stock_data.data['Time Series (5min)'][timeseries]['5. volume']), true);

                            //increase index for all objects
                            i++;
                        }
                        //clear old Objects
                        this.deleteOldObject(stockKey, i);
                    }
                    //this.setState('info.connection', true, true);
                }).catch(error => {
                    this.log.error(error.message)
                    //this.setState('info.connection', false, true);
                });
            }
        });
        this.api_error = false;
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            clearInterval(this.myInterval);

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