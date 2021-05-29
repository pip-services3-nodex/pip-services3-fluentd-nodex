"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const FluentdLogger_1 = require("../../src/log/FluentdLogger");
const LoggerFixture_1 = require("../fixtures/LoggerFixture");
suite('FluentdLogger', () => {
    let _logger;
    let _fixture;
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        let host = process.env['FLUENTD_SERVICE_HOST'] || 'localhost';
        let port = process.env['FLUENTD_SERVICE_PORT'] || 24224;
        _logger = new FluentdLogger_1.FluentdLogger();
        _fixture = new LoggerFixture_1.LoggerFixture(_logger);
        let config = pip_services3_commons_nodex_1.ConfigParams.fromTuples('source', 'test', 'connection.host', host, 'connection.port', port);
        _logger.configure(config);
        yield _logger.open(null);
    }));
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield _logger.close(null);
    }));
    test('Log Level', () => {
        _fixture.testLogLevel();
    });
    test('Simple Logging', () => __awaiter(void 0, void 0, void 0, function* () {
        yield _fixture.testSimpleLogging();
    }));
    test('Error Logging', () => __awaiter(void 0, void 0, void 0, function* () {
        yield _fixture.testErrorLogging();
    }));
});
//# sourceMappingURL=FluentdLogger.test.js.map