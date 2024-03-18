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

export function isWidgetSupportAtomicRepeaters( widgetType ) {
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

export function shouldUseAtomicRepeaters( widgetType ) {
	return isWidgetSupportNesting( widgetType ) &&
		isWidgetSupportAtomicRepeaters( widgetType );
}

export function sortViewsByModels( container ) {
	const models = container.model.get( 'elements' ).models,
		children = container.view.children,
		updatedViews = {};

	models.forEach( ( model, index ) => {
		const view = children.findByModel( model );
		view._index = index;
		updatedViews[ view.cid ] = view;
	} );

	return updatedViews;
}
