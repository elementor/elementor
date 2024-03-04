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

export function shouldUseImprovedRepeaters( widgetType ) {
	return elementorCommon.config.experimentalFeatures.e_nested_atomic_repeaters &&
	isWidgetSupportNesting( widgetType ) &&
	isWidgetSupportImprovedRepeaters( widgetType );
}

export function maybeSortContainerViews( views, insertIndex ) {
	const viewKeys = Object.keys( views ),
		numberOfViews = viewKeys.length;

	if ( insertIndex === numberOfViews - 1 ) {
		return views;
	}

	const updatedViews = {},
		viewObjects = Object.values( views );

	for ( let loopIndex = 0; loopIndex < numberOfViews; loopIndex++ ) {
		if ( insertIndex >= loopIndex ) {
			updatedViews[ viewKeys[ loopIndex ] ] = viewObjects[ loopIndex ];
		} else if ( insertIndex + 1 === loopIndex ) {
			updatedViews[ viewKeys[ numberOfViews - 1 ] ] = viewObjects[ numberOfViews - 1 ];
		} else {
			updatedViews[ viewKeys[ loopIndex - 1 ] ] = viewObjects[ loopIndex - 1 ];
		}
	}

	return updatedViews;
}

export function sortViewsByModels( models, views ) {
	const updatedViews = {};

	models.forEach( ( model ) => {
		const modelId = model.get( 'id' ),
			viewKey = Object.keys( views ).find( ( key ) => modelId === views[ key ].$childViewContainer[ 0 ].attributes[ 'data-id' ].value );

		updatedViews[ viewKey ] = views[ viewKey ];
	} );

	return updatedViews;
}

