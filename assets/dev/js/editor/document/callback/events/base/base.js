import CallableBase from 'elementor-api/modules/callable-base';

export default class Base extends CallableBase {
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
