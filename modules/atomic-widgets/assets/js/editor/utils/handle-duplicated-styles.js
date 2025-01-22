import { updateStyleId } from './update-style-id';
import { getElementChildren } from './get-element-children';

/**
 * @typedef {import('assets/dev/js/editor/container/container')} Container
 */

/**
 * Get a container - iterate over its children, find all styled atomic widgets and update their style ids
 * @param {Container} duplicatedElement
 */
export function handleDuplicatedStyles( duplicatedElement ) {
	const allElements = getElementChildren( duplicatedElement );

	const styledElements = allElements.filter( ( container ) => Object.keys( container.model.get( 'styles' ) ).length > 0 );

	styledElements?.forEach( updateStyleId );
}
