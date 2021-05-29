/** @module log */
import { ConfigParams } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { IReferenceable } from 'pip-services3-commons-nodex';
import { IOpenable } from 'pip-services3-commons-nodex';
import { ConfigException } from 'pip-services3-commons-nodex';
import { CachedLogger } from 'pip-services3-components-nodex';
import { LogMessage } from 'pip-services3-components-nodex';
import { HttpConnectionResolver } from 'pip-services3-rpc-nodex';

/**
 * Logger that dumps execution logs to Fluentd service.
 * 
 * Fluentd is a popular logging service that is often used
 * together with Kubernetes container orchestrator.
 * 
 * Authentication is not supported in this version.
 * 
 * ### Configuration parameters ###
 * 
 * - level:             maximum log level to capture
 * - source:            source (context) name
 * - connection(s):           
 *     - discovery_key:         (optional) a key to retrieve the connection from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]]
 *     - protocol:              connection protocol: http or https
 *     - host:                  host name or IP address
 *     - port:                  port number
 *     - uri:                   resource URI or connection string with all parameters in it
 * - options:
 *     - interval:        interval in milliseconds to save log messages (default: 10 seconds)
 *     - max_cache_size:  maximum number of messages stored in this cache (default: 100)        
 *     - reconnect:       reconnect timeout in milliseconds (default: 60 sec)
 *     - timeout:         invocation timeout in milliseconds (default: 30 sec)
 * 
 * ### References ###
 * 
 * - <code>\*:context-info:\*:\*:1.0</code>   (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/info.contextinfo.html ContextInfo]] to detect the context id and specify counters source
 * - <code>\*:discovery:\*:\*:1.0</code>      (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]] services to resolve connection
 * 
 * ### Example ###
 * 
 *     let logger = new FluentdLogger();
 *     logger.configure(ConfigParams.fromTuples(
 *         "connection.protocol", "http",
 *         "connection.host", "localhost",
 *         "connection.port", 24224
 *     ));
 *     
 *     await logger.open("123");
 *     
 *     logger.error("123", ex, "Error occured: %s", ex.message);
 *     logger.debug("123", "Everything is OK.");
 */
export class FluentdLogger extends CachedLogger implements IReferenceable, IOpenable {
    private _connectionResolver: HttpConnectionResolver = new HttpConnectionResolver();
    
    private _reconnect: number = 10000;
    private _timeout: number = 3000;
    private _timer: any;

    private _client: any = null;

    /**
     * Creates a new instance of the logger.
     */
    public constructor() {
        super();
    }

    /**
     * Configures component by passing configuration parameters.
     * 
     * @param config    configuration parameters to be set.
     */
    public configure(config: ConfigParams): void {
        super.configure(config);

        this._connectionResolver.configure(config);

        this._reconnect = config.getAsIntegerWithDefault('options.reconnect', this._reconnect);
        this._timeout = config.getAsIntegerWithDefault('options.timeout', this._timeout);
    }

    /**
	 * Sets references to dependent components.
	 * 
	 * @param references 	references to locate the component dependencies. 
     */
    public setReferences(references: IReferences): void {
        super.setReferences(references);
        this._connectionResolver.setReferences(references);
    }

    /**
	 * Checks if the component is opened.
	 * 
	 * @returns true if the component has been opened and false otherwise.
     */
    public isOpen(): boolean {
        return this._timer != null;
    }

    /**
	 * Opens the component.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    public async open(correlationId: string): Promise<void> {
        if (this.isOpen()) {
            return;
        }

        let connection = await this._connectionResolver.resolve(correlationId);
        if (connection == null) {
            throw new ConfigException(
                correlationId,
                'NO_CONNECTION',
                'Connection is not configured'
            );
        }

        let host = connection.getAsString("host");
        let port = connection.getAsIntegerWithDefault("port", 24224);

        let options = {
            host: host,
            port: port,
            timeout: this._timeout / 1000,
            reconnectInterval: this._reconnect
        };

        this._client = require('fluent-logger');
        this._client.configure(null, options);

        this._timer = setInterval(() => { this.dump(); }, this._interval);
    }

    /**
	 * Closes component and frees used resources.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    public async close(correlationId: string): Promise<void> {
        await this.save (this._cache);

        if (this._timer) {
            clearInterval(this._timer);
        }

        this._cache = [];
        this._timer = null;
        this._client = null;
    }

    /**
     * Saves log messages from the cache.
     * 
     * @param messages  a list with log messages
     */
    protected async save(messages: LogMessage[]): Promise<void> {
        if (!this.isOpen() || messages.length == 0) {
            return;
        }

        for (let message of messages) {
            let record = {
                level: message.level,
                source: message.source,
                correlation_id: message.correlation_id,
                error: message.error,
                message: message.message
            };

            await new Promise<void>((resolve, reject) => {
                this._client.emit(message.level, record, (err) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        }
    }
}