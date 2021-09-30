import HookUIAfter from 'elementor-api/modules/hooks/ui/after';

export default class Base extends HookUIAfter {
	getContainerType() {
		return 'widget';
	}

	getConditions( args ) {
		// eslint-disable-next-line camelcase
		return elementor.nestedElements.isWidgetSupportNesting( args.name );
	}
}
