/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */

/**
 * @param {Container} container
 * @return {string}
 */
export function getRandomStyleId( container ) {
	return `s-${ container.id }-${ elementorCommon.helpers.getUniqueId() }`;
}
