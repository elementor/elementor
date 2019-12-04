import CallbackBase from '../../base/base';

export default class Base extends CallbackBase {
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
