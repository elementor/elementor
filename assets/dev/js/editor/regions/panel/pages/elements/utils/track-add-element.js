export function trackAddElement( model ) {
	if ( ! elementorCommon?.eventsManager?.dispatchEvent ) {
		return;
	}

	const elType = model?.elType ?? '';
	const widgetType = model?.widgetType ?? '';
	const elementName = 'widget' === elType ? widgetType : elType;

	elementorCommon.eventsManager.dispatchEvent( 'add_element', {
		location: 'editor_panel',
		element_name: elementName,
		element_type: elType,
		widget_type: widgetType,
	} );
}
