import { type V1ElementData } from '@elementor/editor-elements';

import { type ComponentInstanceOverride } from '../prop-types/component-instance-overrides-prop-type';
import { isComponentInstance } from './is-component-instance';

export function applyOverridesToElements(
	elements: V1ElementData[],
	overrides: ComponentInstanceOverride[]
): V1ElementData[] {
	if ( ! overrides?.length ) {
		return structuredClone( elements );
	}

	const overrideMap = createOverrideMap( overrides );

	return elements.map( ( element ) => applyOverridesToElement( element, overrideMap ) );
}

function createOverrideMap( overrides: ComponentInstanceOverride[] ): Map< string, unknown > {
	const map = new Map< string, unknown >();

	overrides.forEach( ( override ) => {
		map.set( override.override_key, override.override_value );
	} );

	return map;
}

function applyOverridesToElement( element: V1ElementData, overrideMap: Map< string, unknown > ): V1ElementData {
	const clonedElement = structuredClone( element );

	if ( isComponentInstance( { widgetType: element.widgetType, elType: element.elType } ) ) {
		return clonedElement;
	}

	const elementId = clonedElement.id;

	if ( clonedElement.settings ) {
		clonedElement.settings = applyOverridesToSettings( clonedElement.settings, elementId, overrideMap );
	}

	if ( clonedElement.elements?.length ) {
		clonedElement.elements = clonedElement.elements.map( ( child ) =>
			applyOverridesToElement( child, overrideMap )
		);
	}

	return clonedElement;
}

function applyOverridesToSettings(
	settings: V1ElementData[ 'settings' ],
	elementId: string,
	overrideMap: Map< string, unknown >
): V1ElementData[ 'settings' ] {
	if ( ! settings ) {
		return settings;
	}

	const updatedSettings = { ...settings };

	for ( const [ settingKey ] of Object.entries( settings ) ) {
		const overrideKey = `${ elementId }_${ settingKey }`;

		if ( overrideMap.has( overrideKey ) ) {
			updatedSettings[ settingKey ] = overrideMap.get( overrideKey );
		}
	}

	return updatedSettings;
}
