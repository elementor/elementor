/**
 * @typedef {import('assets/dev/js/editor/container/container')} Container
 */

/**
 * return all recursively nested elements in a flat array
 *
 * @param {Container} model
 * @return {Container[]}
 */
export function getElementChildren( model ) {
	const container = window.elementor.getContainer( model.id );
	const children = ( container.model?.get( 'elements' )?.models ?? [] ).flatMap( ( child ) => getElementChildren( child ) ) ?? [];

	return [ container, ...children ];
}
