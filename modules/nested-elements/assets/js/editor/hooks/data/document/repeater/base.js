import HookDataAfter from 'elementor-api/modules/hooks/data/after';

export default class Base extends HookDataAfter {
	getContainerType() {
		return 'widget';
	}

	getConditions( args ) {
		// eslint-disable-next-line camelcase
		return elementor.nestedElements.isWidgetSupportNesting( args.name );
	}
}
