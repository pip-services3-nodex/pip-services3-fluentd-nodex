/** @module build */
import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';

import { FluentdLogger } from '../log/FluentdLogger';

/**
 * Creates Fluentd components by their descriptors.
 * 
 * @see [[FluentdLogger]]
 */
export class DefaultFluentdFactory extends Factory {
	private static readonly FluentdLoggerDescriptor = new Descriptor("pip-services", "logger", "fluentd", "*", "1.0");

	/**
	 * Create a new instance of the factory.
	 */
	public constructor() {
        super();
		this.registerAsType(DefaultFluentdFactory.FluentdLoggerDescriptor, FluentdLogger);
	}
}