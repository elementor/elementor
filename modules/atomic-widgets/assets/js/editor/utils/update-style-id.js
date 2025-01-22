import { getRandomStyleId } from './get-random-style-id';

/**
 * @typedef {import('assets/dev/js/editor/container/container')} Container
 */

/**
 * Update the style id of the container.
 * @param {Container} container
 */
export function updateStyleId( container ) {
	const widgetsCache = window.elementor?.widgetsCache ?? {};

	const elType = container.model.get( 'elType' );
	const widgetType = elType !== 'widget' ? elType : container.model.get( 'widgetType' );
	const originalStyles = container.model.get( 'styles' );
	const settings = container.settings?.toJSON() ?? {};

	const elementType = widgetType ? widgetsCache?.[ widgetType ] : null;

	const [ classesPropKey ] = Object.entries( elementType?.atomic_props_schema ?? {} ).find(
		( [ , propType ] ) => 'plain' === propType.kind && 'classes' === propType.key,
	) ?? [];

	const originalClasses =
		classesPropKey && settings ? settings[ classesPropKey ]?.value : null;

	const newStyles = {};

	const changedIds = {}; // Conversion map - {[originalId: string]: newId: string}

	Object.entries( originalStyles ).forEach( ( [ originalStyleId, style ] ) => {
		const newStyleId = getRandomStyleId( container );

		newStyles[ newStyleId ] = structuredClone( { ...style, id: newStyleId } );

		changedIds[ originalStyleId ] = newStyleId;
	} );

	const newClasses = {
		...settings[ classesPropKey ],
		value: originalClasses.map( ( className ) => changedIds[ className ] ?? className ),
	};

	// Update classes array
	$e.internal( 'document/elements/set-settings', {
		container,
		settings: {
			[ classesPropKey ]: newClasses,
		},
	} );

	// Update local styles
	container.model.set( 'styles', newStyles );
}
