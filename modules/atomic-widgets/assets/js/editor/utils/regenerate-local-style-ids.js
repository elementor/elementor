import { getElementChildren } from './get-element-children';
import { getRandomStyleId } from './get-random-style-id';

/**
 * @typedef {import('assets/dev/js/editor/container/container')} Container
 */

function isClassesProp( prop ) {
	return prop.$$type && 'classes' === prop.$$type && Array.isArray( prop.value ) && prop.value.length > 0;
}

/**
 * Update the style id of the element.
 * Works with both rendered containers and unrendered models.
 *
 * @param {Container|Object} element
 */
function updateStyleId( element ) {
	const container = window.elementor.getContainer( element.id );
	const model = container?.model ?? element;
	const settings = container?.settings ?? model.get( 'settings' );

	const originalStyles = model.get( 'styles' );
	const settingsJson = settings?.toJSON() ?? {};

	const classesProps = Object.entries( settingsJson ).filter(
		( [ , propValue ] ) => ( isClassesProp( propValue ) ),
	);

	const newStyles = {};
	const changedIds = {};

	Object.entries( originalStyles ).forEach( ( [ originalStyleId, style ] ) => {
		const newStyleId = getRandomStyleId( element, newStyles );
		newStyles[ newStyleId ] = structuredClone( { ...style, id: newStyleId } );
		changedIds[ originalStyleId ] = newStyleId;
	} );

	const newClassesProps = classesProps.map( ( [ key, value ] ) => {
		return [ key, {
			...value,
			value: value.value.map( ( className ) => changedIds[ className ] ?? className ),
		} ];
	}, {} );

	const newSettings = Object.fromEntries( newClassesProps );

	// Use the command when view exists to trigger proper rendering.
	// For unrendered elements, set directly on model - they'll render with correct values.
	if ( container ) {
		$e.internal( 'document/elements/set-settings', {
			container,
			settings: newSettings,
		} );
	} else {
		settings.set( newSettings );
	}

	model.set( 'styles', newStyles );
}

function updateElementsStyleIdsInsideOut( styledElements ) {
	styledElements?.reverse().forEach( updateStyleId );
}

/**
 * Get a container - iterate over its children, find all styled atomic widgets and update their style ids
 *
 * @param {Container} container
 */
export function regenerateLocalStyleIds( container ) {
	const allElements = getElementChildren( container );

	const styledElements = allElements.filter( ( element ) => {
		const model = element.model ?? element;
		return Object.keys( model.get( 'styles' ) ?? {} ).length > 0;
	} );

	updateElementsStyleIdsInsideOut( styledElements );
}
