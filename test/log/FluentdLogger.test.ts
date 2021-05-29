import { ConfigParams } from 'pip-services3-commons-nodex';

import { FluentdLogger } from '../../src/log/FluentdLogger';
import { LoggerFixture } from '../fixtures/LoggerFixture';

suite('FluentdLogger', ()=> {
    let _logger: FluentdLogger;
    let _fixture: LoggerFixture;

    setup(async () => {
        let host = process.env['FLUENTD_SERVICE_HOST'] || 'localhost';
        let port = process.env['FLUENTD_SERVICE_PORT'] || 24224;

        _logger = new FluentdLogger();
        _fixture = new LoggerFixture(_logger);

        let config = ConfigParams.fromTuples(
            'source', 'test',
            'connection.host', host,
            'connection.port', port
        );
        _logger.configure(config);

        await _logger.open(null);
    });

    teardown(async () => {
        await _logger.close(null);
    });

    test('Log Level', () => {
        _fixture.testLogLevel();
    });

    test('Simple Logging', async () => {
        await _fixture.testSimpleLogging();
    });

    test('Error Logging', async () => {
        await _fixture.testErrorLogging();
    });

});