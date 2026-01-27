import { getElementChildren } from './get-element-children';
import { getRandomStyleId } from './get-random-style-id';

/**
 * @typedef {import('assets/dev/js/editor/container/container')} Container
 */

function isClassesProp( prop ) {
	return prop.$$type && 'classes' === prop.$$type && Array.isArray( prop.value ) && prop.value.length > 0;
}

function calculateNewStylesAndSettings( element, model, settings ) {
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

	return {
		newStyles,
		newSettings: Object.fromEntries( newClassesProps ),
	};
}

function updateStyleIdForContainer( container ) {
	const { model, settings } = container;
	const { newStyles, newSettings } = calculateNewStylesAndSettings( container, model, settings );

	$e.internal( 'document/elements/set-settings', { container, settings: newSettings } );
	model.set( 'styles', newStyles );
}

function updateStyleIdForModel( model ) {
	const settings = model.get( 'settings' );
	const { newStyles, newSettings } = calculateNewStylesAndSettings( model, model, settings );

	settings.set( newSettings );
	model.set( 'styles', newStyles );
}

function updateStyleId( element ) {
	const container = window.elementor.getContainer( element.id );

	if ( container ) {
		updateStyleIdForContainer( container );
		return;
	}

	updateStyleIdForModel( element );
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
