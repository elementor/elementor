import CallableBase from 'elementor-api/modules/callable-base';

export default class EventBase extends CallableBase {
	getType() {
		return 'event';
	}

	/**
	 * @inheritDoc
	 *
	 * @param {{}} args
	 *
	 * @returns {*}
	 */
	apply( args ) {
		super.apply( args );
	}
}
