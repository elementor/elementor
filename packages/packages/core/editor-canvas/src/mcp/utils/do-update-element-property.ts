import {
	createElementStyle,
	getElementStyles,
	getWidgetsCache,
	updateElementSettings,
	updateElementStyle,
} from '@elementor/editor-elements';
import { getPropSchemaFromCache, type PropValue, Schema, type TransformablePropValue } from '@elementor/editor-props';
import { type CustomCss, getStylesSchema } from '@elementor/editor-styles';
import { type Utils as IUtils } from '@elementor/editor-variables';
import { AppContext } from '@elementor/env';

type OwnParams = {
	elementId: string;
	elementType: string;
	propertyName: string;
	propertyValue: string | PropValue | TransformablePropValue< string, unknown >;
};

export async function resolvePropValue( value: unknown, forceKey?: string ) {
	const Utils = await AppContext.require< typeof IUtils >( 'Variables::Utils' );
	return Schema.adjustLlmPropValueSchema( value as PropValue, {
		forceKey,
		transformers: Utils.globalVariablesLLMResolvers,
	} );
}

/*
 * This function expects a PropValue bag for updaing an element.
 * Also, it supports updating styles "on-the-way" by checking for "_styles" property with PropValue bag that fits the common style schema.
 */
export const doUpdateElementProperty = async ( params: OwnParams ) => {
	const { elementId, propertyName, propertyValue, elementType } = params;
	if ( propertyName === '_styles' ) {
		const elementStyles = getElementStyles( elementId ) || {};
		const propertyMapValue = propertyValue as Record< string, PropValue >;
		const styleSchema = getStylesSchema();

		const transformedStyleValues: Record< string, PropValue > = {};

		for await ( const [ key, value ] of Object.entries( propertyMapValue ) ) {
			if ( key === 'custom_css' ) {
				transformedStyleValues[ key ] = value;
				continue;
			}
			const { key: propKey, kind } = styleSchema?.[ key ] || {};
			if ( ! propKey || kind !== 'union' ) {
				throw new Error( `_styles property ${ key } is not supported.` );
			}
			transformedStyleValues[ key ] = await resolvePropValue( value, propKey );
		}

		let customCss: CustomCss | undefined;
		Object.keys( propertyMapValue as Record< string, unknown > ).forEach( ( stylePropName ) => {
			const propertyRawSchema = styleSchema[ stylePropName ];
			if ( stylePropName === 'custom_css' ) {
				let customCssValue = propertyMapValue[ stylePropName ] as Record< string, unknown > | string;
				if ( typeof customCssValue === 'object' && customCssValue && customCssValue.value ) {
					customCssValue = String( customCssValue.value );
				}
				if ( ! customCssValue ) {
					customCssValue = '';
				}
				customCss = {
					raw: btoa( customCssValue as string ),
				};
				return;
			}
			const isSupported = !! propertyRawSchema;
			if ( ! isSupported ) {
				throw new Error( `Style property ${ stylePropName } is not supported.` );
			}
			if ( propertyRawSchema.kind === 'plain' ) {
				if ( typeof ( propertyMapValue as Record< string, unknown > )[ stylePropName ] !== 'object' ) {
					const propUtil = getPropSchemaFromCache( propertyRawSchema.key );
					if ( propUtil ) {
						const plainValue = propUtil.create( propertyMapValue[ stylePropName ] );
						propertyMapValue[ stylePropName ] = plainValue;
					}
				}
			}
		} );
		delete transformedStyleValues.custom_css;
		const localStyle = Object.values( elementStyles ).find( ( style ) => style.label === 'local' );
		if ( ! localStyle ) {
			createElementStyle( {
				elementId,
				...( typeof customCss !== 'undefined' ? { custom_css: customCss } : {} ),
				classesProp: 'classes',
				label: 'local',
				meta: {
					breakpoint: 'desktop',
					state: null,
				},
				props: {
					...transformedStyleValues,
				},
			} );
		} else {
			updateElementStyle( {
				elementId,
				styleId: localStyle.id,
				meta: {
					breakpoint: 'desktop',
					state: null,
				},
				...( typeof customCss !== 'undefined' ? { custom_css: customCss } : {} ),
				props: {
					...transformedStyleValues,
				},
			} );
		}
		return;
	}

	const elementPropSchema = getWidgetsCache()?.[ elementType ]?.atomic_props_schema;
	if ( ! elementPropSchema ) {
		throw new Error( `No prop schema found for element type: ${ elementType }` );
	}
	if ( ! elementPropSchema[ propertyName ] ) {
		const propertyNames = Object.keys( elementPropSchema );
		throw new Error(
			`Property "${ propertyName }" does not exist on element type "${ elementType }". Available properties are: ${ propertyNames.join(
				', '
			) }`
		);
	}
	const propKey = elementPropSchema[ propertyName ].key;
	const value = resolvePropValue( propertyValue, propKey );
	updateElementSettings( {
		id: elementId,
		props: {
			[ propertyName ]: value,
		},
		withHistory: false,
	} );
};
