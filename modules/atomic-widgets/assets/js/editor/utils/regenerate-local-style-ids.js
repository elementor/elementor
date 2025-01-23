import { getElementChildren } from './get-element-children';
import { getRandomStyleId } from './get-random-style-id';

/**
 * @typedef {import('assets/dev/js/editor/container/container')} Container
 */

function isClassesProp( prop ) {
	return prop.$$type && Array.isArray( prop.value ) && prop.value.length > 0;
}

/**
 * Update the style id of the container.
 * @param {Container} container
 */
function updateStyleId( container ) {
	const originalStyles = container.model.get( 'styles' );
	const settings = container.settings?.toJSON() ?? {};

	const classesProps = Object.entries( settings ).reduce(
		( props, [ propKey, propValue ] ) =>
			( isClassesProp( propValue ) )
				? [ ...props, propKey ]
				: props,
		[],
	);

	const newStyles = {};

	const changedIds = {}; // Conversion map - {[originalId: string]: newId: string}
	const styleIdToClassesPropKey = classesProps.reduce( ( map, classesPropKey ) => {
		const classes = settings[ classesPropKey ].value;

		classes.forEach( ( styleId ) => {
			map[ styleId ] = classesPropKey;
		} );

		return map;
	}, {} );

	Object.entries( originalStyles ).forEach( ( [ originalStyleId, style ] ) => {
		if ( styleIdToClassesPropKey[ originalStyleId ] ) {
			const newStyleId = getRandomStyleId( container );

			newStyles[ newStyleId ] = structuredClone( { ...style, id: newStyleId } );

			changedIds[ originalStyleId ] = newStyleId;
		}
	} );

	const newClassesProps = classesProps.reduce( ( allClassesProps, classPropKey ) => {
		return {
			...allClassesProps,
			[ classPropKey ]: {
				...settings[ classPropKey ],
				value: settings[ classPropKey ].value.map( ( className ) => changedIds[ className ] ?? className ),
			},
		};
	}, {} );

	// Update classes array
	$e.internal( 'document/elements/set-settings', {
		container,
		settings: newClassesProps,
	} );

	// Update local styles
	container.model.set( 'styles', newStyles );
}

/**
 * Get a container - iterate over its children, find all styled atomic widgets and update their style ids
 * @param {Container} container
 */
export function regenerateLocalStyleIds( container ) {
	const allElements = getElementChildren( container );

	const styledElements = allElements.filter( ( element ) => Object.keys( element.model.get( 'styles' ) ).length > 0 );

	styledElements?.forEach( updateStyleId );
}
