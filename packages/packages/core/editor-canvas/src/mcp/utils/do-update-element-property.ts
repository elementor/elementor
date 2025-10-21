import {
	createElementStyle,
	getElementStyles,
	updateElementSettings,
	updateElementStyle,
} from '@elementor/editor-elements';
import { getPropSchemaFromCache, type PropValue, stringPropTypeUtil } from '@elementor/editor-props';

import { getElementSchemaAsZod } from './get-element-configuration-schema';

type OwnParams = {
	elementId: string;
	elementType: string;
	propertyName: string;
	propertyValue: unknown;
};

export const doUpdateElementProperty = async ( params: OwnParams ) => {
	const { elementId, propertyName, propertyValue, elementType } = params;
	if ( propertyName === '_styles' ) {
		const elementStyles = getElementStyles( elementId ) || {};
		const styleValues: Record< string, PropValue > = {};
		Object.keys( propertyValue as Record< string, unknown > ).forEach( ( stylePropName ) => {
			const value = ( propertyValue as Record< string, unknown > )[ stylePropName ];
			if ( typeof value === 'string' ) {
				styleValues[ stylePropName ] = stringPropTypeUtil.create( value );
			}
		} );
		const localStyle = Object.values( elementStyles ).find( ( style ) => style.label === 'local' );
		if ( ! localStyle ) {
			createElementStyle( {
				elementId,
				classesProp: 'classes',
				label: 'local',
				meta: {
					breakpoint: null,
					state: null,
				},
				props: {
					...( propertyValue as Record< string, string > ),
				},
			} );
		} else {
			const styleId = localStyle.id;
			updateElementStyle( {
				elementId,
				styleId,
				meta: {
					breakpoint: null,
					state: null,
				},
				props: {
					...styleValues,
				},
			} );
		}
		return;
	}
	const { schema } = getElementSchemaAsZod( elementType );
	if ( ! schema?.hasOwnProperty( propertyName ) ) {
		throw new Error(
			`Property ${ propertyName } does not exist on element type ${ params.elementType }. Use the 'get-element-configuration-schema' tool first!`
		);
	}

	const rawPropertySchema = schema[ propertyName ];
	const expectedType = rawPropertySchema.meta?.llm?.propType;

	if ( ! expectedType ) {
		throw new Error(
			`Property ${ propertyName } on element type ${ params.elementType } does not support LLM configuration.`
		);
	}

	const propUtil = getPropSchemaFromCache( expectedType );

	if ( ! propUtil ) {
		throw new Error(
			`No prop util found for expected type ${ expectedType } on property ${ propertyName } of element type ${ params.elementType }.`
		);
	}

	const value = propUtil.create( propertyValue as PropValue );

	updateElementSettings( {
		id: elementId,
		props: {
			[ propertyName ]: value,
		},
		withHistory: false,
	} );
};
