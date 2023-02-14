export function extractNestedItemTitle( container, index ) {
	const title = container.view.model.config.defaults.elements_title;

	// Translations comes from server side.
	return sprintf( title, index );
}

export function isWidgetSupportNesting( widgetType ) {
	const widgetConfig = elementor.widgetsCache[ widgetType ];

	if ( ! widgetConfig ) {
		return false;
	}

	return widgetConfig.support_nesting;
}

export function findChildContainerOrFail( container, index, containerModelCid = false ) {
	let childView = false;

	if ( ! containerModelCid ) {
		childView = container.view.children.findByIndex( index );
	} else {
		childView = container.view.children.findByModelCid( containerModelCid );
	}

	if ( ! childView && ! containerModelCid ) {
		return false;
	}

	if ( ! childView ) {
		throw new Error( 'Child container was not found for the current repeater item.' );
	}

	return childView.getContainer();
}
