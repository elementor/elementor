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

export function isWidgetSupportImprovedRepeaters( widgetType ) {
	const widgetConfig = elementor.widgetsCache[ widgetType ];

	if ( ! widgetConfig ) {
		return false;
	}

	return widgetConfig.support_improved_repeaters;
}

export function widgetNodes( widgetType ) {
	const widgetConfig = elementor.widgetsCache[ widgetType ];

	if ( ! widgetConfig ) {
		return false;
	}

	return {
		targetContainer: widgetConfig.target_container,
		node: widgetConfig.node,
	};
}


export function findChildContainerOrFail( container, index ) {
	const childView = container.view.children.findByIndex( index );

	if ( ! childView ) {
		throw new Error( 'Child container was not found for the current repeater item.' );
	}

	return childView.getContainer();
}
