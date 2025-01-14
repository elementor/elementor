/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */

/**
 *
 * @param {Container} container
 * @return {Container[]}
 */
export function getElementChildren( container ) {
	const children = ( container.model?.get( 'elements' )?.models ?? [] ).flatMap( ( child ) => getElementChildren( child ) ) ?? [];

	return [ container, ...children ];
}
