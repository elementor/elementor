import HookBase from 'elementor-api/modules/hook-base';

export default class Base extends HookBase {
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
