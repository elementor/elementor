/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */

/**
 * @param {Container} container
 * @param {Object}    existingStyleIds
 * @return {string}
 */
export function getRandomStyleId( container, existingStyleIds = {} ) {
	let id;

	do {
		id = `e-${ container.id }-${ elementorCommon.helpers.getUniqueId() }`;
	}
	while ( existingStyleIds.hasOwnProperty( id ) );

	return id;
}
