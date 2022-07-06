import { isWidgetSupportNesting } from 'elementor/modules/nested-elements/assets/js/editor/utils';

export default class Base extends $e.modules.hookData.After {
	getContainerType() {
		return 'widget';
	}

	getConditions( args ) {
		return isWidgetSupportNesting( args.container.model.get( 'widgetType' ) );
	}
}
