export default class Base extends $e.modules.hookData.After {
	getContainerType() {
		return 'widget';
	}

	getConditions( args ) {
		// eslint-disable-next-line camelcase
		return elementor.modules.nestedElements.isWidgetSupportNesting( args.name );
	}
}
