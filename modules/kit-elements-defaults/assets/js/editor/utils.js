export function isPopulatedObject( obj ) {
	return obj &&
		'object' === typeof obj &&
		! Array.isArray( obj ) &&
		Object.keys( obj ).length > 0;
}

export function extractElementType( model ) {
	model = model.attributes || model;

	let elementType = model.widgetType || model.elType;

	if ( 'section' === elementType && model.isInner ) {
		elementType = 'inner-section';
	}

	return elementType;
}
