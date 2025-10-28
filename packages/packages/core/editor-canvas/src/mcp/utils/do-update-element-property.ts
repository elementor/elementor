import {
	createElementStyle,
	getElementStyles,
	updateElementSettings,
	updateElementStyle,
} from '@elementor/editor-elements';
import { getPropSchemaFromCache, type PropValue } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';

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
			const schema = getStylesSchema();
			const expectedType = schema[ stylePropName ]?.meta?.llm?.propType;

			if ( ! expectedType ) {
				throw new Error(
					`Property ${ propertyName } on element type ${ params.elementType } does not support LLM configuration.`
				);
			}

			const propUtil = getPropSchemaFromCache( expectedType );
			if ( ! propUtil ) {
				return;
			}
			const value = ( propertyValue as Record< string, unknown > )[ stylePropName ];
			styleValues[ stylePropName ] = propUtil.create( value as PropValue );
		} );
		const localStyle = Object.values( elementStyles ).find( ( style ) => style.label === 'local' );
		if ( ! localStyle ) {
			createElementStyle( {
				elementId,
				classesProp: 'classes',
				label: 'local',
				meta: {
					breakpoint: 'desktop',
					state: null,
				},
				props: {
					...styleValues,
				},
			} );
		} else {
			const styleId = localStyle.id;
			updateElementStyle( {
				elementId,
				styleId,
				meta: {
					breakpoint: 'desktop',
					state: null,
				},
				props: {
					...styleValues,
				},
			} );
		}
		return;
	}

	const { schema } = getElementSchemaAsZod( elementType, true );
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

	if ( ! rawPropertySchema ) {
		throw new Error(
			`Property ${ propertyName } does not exist on element type ${ params.elementType }. Use the 'get-element-configuration-schema' tool first!`
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
