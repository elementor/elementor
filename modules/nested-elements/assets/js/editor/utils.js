export function extractNestedItemTitle( container, index ) {
	const title = container.view.model.config.defaults.elements_title;

	// Translations comes from server side.
	return sprintf( title, index );
}

export function isWidgetSupportNesting( widgetType ) {
	// eslint-disable-next-line camelcase
	return elementor.widgetsCache[ widgetType ]?.support_nesting;
}

export function findChildContainerOrFaild( container, index ) {
	const childView = container.view.children.findByIndex( index );

	if ( ! childView ) {
		throw new Error( 'Child container was not founded for the current repeater item.' );
	}

	return childView.getContainer();
}
