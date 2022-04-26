export default class Base extends $e.modules.hookData.After {
	getContainerType() {
		return 'widget';
	}

	getConditions( args ) {
		return $e.components.get( 'nested-elements' ).isWidgetSupportNesting( args.container.model.get( 'widgetType' ) );
	}
}
