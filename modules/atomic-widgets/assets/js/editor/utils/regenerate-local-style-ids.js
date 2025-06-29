import { getElementChildren } from './get-element-children';
import { getRandomStyleId } from './get-random-style-id';

/**
 * @typedef {import('assets/dev/js/editor/container/container')} Container
 */

function isClassesProp( prop ) {
	return prop.$$type && 'classes' === prop.$$type && Array.isArray( prop.value ) && prop.value.length > 0;
}

/**
 * Update the style id of the container.
 * @param {Container} container
 */
function updateStyleId( container ) {
	const originalStyles = container.model.get( 'styles' );
	const settings = container.settings?.toJSON() ?? {};

	const classesProps = Object.entries( settings ).filter(
		( [ , propValue ] ) => ( isClassesProp( propValue ) ),
	);

	const newStyles = {};

	const changedIds = {}; // Conversion map - {[originalId: string]: newId: string}

	Object.entries( originalStyles ).forEach( ( [ originalStyleId, style ] ) => {
		const newStyleId = getRandomStyleId( container, newStyles );

		newStyles[ newStyleId ] = structuredClone( { ...style, id: newStyleId } );

		changedIds[ originalStyleId ] = newStyleId;
	} );

	const newClassesProps = classesProps.map( ( [ key, value ] ) => {
		return [ key, {
			...value,
			value: value.value.map( ( className ) => changedIds[ className ] ?? className ),
		} ];
	}, {} );

	// Update classes array
	$e.internal( 'document/elements/set-settings', {
		container,
		settings: Object.fromEntries( newClassesProps ),
	} );

	// Update local styles
	container.model.set( 'styles', newStyles );
}

function updateElementsStyleIdsInsideOut( styledElements ) {
	styledElements?.reverse().forEach( updateStyleId );
}

/**
 * Get a container - iterate over its children, find all styled atomic widgets and update their style ids
 * @param {Container} container
 */
export function regenerateLocalStyleIds( container ) {
	const allElements = getElementChildren( container );

	const styledElements = allElements.filter( ( element ) => Object.keys( element.model.get( 'styles' ) ?? {} ).length > 0 );

	updateElementsStyleIdsInsideOut( styledElements );
}
