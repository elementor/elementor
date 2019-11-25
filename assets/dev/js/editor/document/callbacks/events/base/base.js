import CallbackBase from '../../base/base';

export default class Base extends CallbackBase {
	type() {
		return $e.events;
	}

	/**
	 * @inheritDoc
	 *
	 * @param {{}} args
	 *
	 * @returns {*}
	 */
	apply( args ) { // eslint-disable-line no-unused-vars
		super.apply( args );
	}
}
