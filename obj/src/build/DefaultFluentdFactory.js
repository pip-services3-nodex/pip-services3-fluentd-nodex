"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultFluentdFactory = void 0;
/** @module build */
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const FluentdLogger_1 = require("../log/FluentdLogger");
/**
 * Creates Fluentd components by their descriptors.
 *
 * @see [[FluentdLogger]]
 */
class DefaultFluentdFactory extends pip_services3_components_nodex_1.Factory {
    /**
     * Create a new instance of the factory.
     */
    constructor() {
        super();
        this.registerAsType(DefaultFluentdFactory.FluentdLoggerDescriptor, FluentdLogger_1.FluentdLogger);
    }
}
exports.DefaultFluentdFactory = DefaultFluentdFactory;
DefaultFluentdFactory.FluentdLoggerDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services", "logger", "fluentd", "*", "1.0");
//# sourceMappingURL=DefaultFluentdFactory.js.map