import {
	getAllDescendants,
	getContainer,
	updateElementSettings,
	type V1Element,
	type V1ElementData,
} from '@elementor/editor-elements';
import { type Props, type PropValue } from '@elementor/editor-props';

import { componentOverridablePropTypeUtil } from '../prop-types/component-overridable-prop-type';

type ElementSettings = Record< string, unknown >;

export function cleanOverridablePropsForContainers( result: V1Element | V1Element[] ) {
	const containers = Array.isArray( result ) ? result : [ result ];

	containers.forEach( ( container ) => {
		cleanOverridablePropsRecursive( container.id );
	} );
}

function cleanOverridablePropsRecursive( elementId: string ) {
	const container = getContainer( elementId );

	if ( ! container ) {
		return;
	}

	getAllDescendants( container ).forEach( cleanOverridablePropsForElement );
}

function cleanOverridablePropsForElement( element: V1Element ) {
	const settings = element.settings?.toJSON() ?? {};
	const cleanedSettings = cleanOverridablePropsFromSettings( settings );

	if ( ! cleanedSettings ) {
		return;
	}

	updateElementSettings( {
		id: element.id,
		props: cleanedSettings,
		withHistory: false,
	} );
}

export function cleanOverridablePropsFromSettings( settings: ElementSettings ): Props | null {
	const cleanedProps: Props = {};
	let hasOverridableProps = false;

	for ( const [ key, value ] of Object.entries( settings ) ) {
		if ( componentOverridablePropTypeUtil.isValid( value ) ) {
			hasOverridableProps = true;
			const overridableValue = componentOverridablePropTypeUtil.extract( value );
			cleanedProps[ key ] = ( overridableValue?.origin_value ?? null ) as PropValue;
		}
	}

	return hasOverridableProps ? cleanedProps : null;
}

export function cleanOverridablePropsFromElementData( element: V1ElementData ): V1ElementData {
	const cleanedElement = { ...element };

	if ( cleanedElement.settings ) {
		const cleanedSettings = cleanOverridablePropsFromSettings( cleanedElement.settings );

		if ( cleanedSettings ) {
			cleanedElement.settings = { ...cleanedElement.settings, ...cleanedSettings };
		}
	}

	if ( cleanedElement.elements?.length ) {
		cleanedElement.elements = cleanedElement.elements.map( cleanOverridablePropsFromElementData );
	}

	return cleanedElement;
}
