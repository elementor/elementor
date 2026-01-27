export function getElementChildren( model ) {
	const childModels = model?.get( 'elements' )?.models ?? [];
	const children = childModels.flatMap( getElementChildren );

	return [ model, ...children ];
}
