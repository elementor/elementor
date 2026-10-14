export function getElementChildren( model ) {
	if ( ! model ) {
		return [];
	}

	const childModels = model.get( 'elements' )?.models ?? [];
	const children = childModels.flatMap( getElementChildren );

	return [ model, ...children ];
}
