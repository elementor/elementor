/**
 * @typedef {import('assets/dev/js/editor/container/container')} Container
 */

/**
 * Return all recursively nested elements in a flat array.
 * Works with both rendered containers and unrendered models.
 *
 * Nested elements (e.g. tabs) render their children asynchronously.
 * When duplicating, the model is cloned synchronously but views may not exist yet.
 * This function falls back to traversing via model when container is not available.
 *
 * @param {Container|Object} containerOrModel
 * @return {(Container|Object)[]}
 */
export function getElementChildren( containerOrModel ) {
	const container = window.elementor.getContainer( containerOrModel.id );
	const model = container?.model ?? containerOrModel;
	const childModels = model?.get( 'elements' )?.models ?? [];
	const children = childModels.flatMap( getElementChildren );

	return [ container ?? model, ...children ];
}
