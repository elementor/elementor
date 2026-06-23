import {
	createElementStyle,
	getElementStyles,
	getWidgetsCache,
	updateElementSettings,
	updateElementStyle,
} from '@elementor/editor-elements';
import { getPropSchemaFromCache, type PropValue, Schema, type TransformablePropValue } from '@elementor/editor-props';
import { type CustomCss, getStylesSchema, getVariantByMeta } from '@elementor/editor-styles';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';
import { type Utils as IUtils } from '@elementor/editor-variables';
import { type z } from '@elementor/schema';

import { mergeCustomCssText, readStoredCustomCssText } from './merge-custom-css';
import { resolveCanonicalPropName } from './resolve-canonical-prop-name';
import { DYNAMIC_PROP_TYPE_KEY, dynamicTagLLMResolver } from './resolve-dynamic-tag';

// TODO: see https://elementor.atlassian.net/browse/ED-22513 for better cross-module access
type XElementor = z.infer< z.ZodAny >;
const LOCAL_STYLE_META = {
	breakpoint: 'desktop',
	state: null,
} as const;
type CustomCssWriteMode = 'replace' | 'merge-with-stored';
type OwnParams = {
	elementId: string;
	elementType: string;
	propertyName: string;
	propertyValue: string | PropValue | TransformablePropValue< string, unknown >;
	customCssWriteMode?: CustomCssWriteMode;
};

export function resolvePropValue( value: unknown, forceKey?: string ): PropValue {
	// TODO: see https://elementor.atlassian.net/browse/ED-22513 for better cross-module access
	const Utils = ( ( ( window as XElementor ).elementorV2 as XElementor ).editorVariables as XElementor )
		.Utils as typeof IUtils;
	return Schema.adjustLlmPropValueSchema( value as PropValue, {
		forceKey,
		transformers: {
			...Utils.globalVariablesLLMResolvers,
			[ DYNAMIC_PROP_TYPE_KEY ]: dynamicTagLLMResolver,
		},
	} );
}

/*
 * This function expects a PropValue bag for updating an element.
 * Also, it supports updating styles "on-the-way" by checking for "_styles" property with PropValue bag that fits the common style schema.
 */
export const doUpdateElementProperty = ( params: OwnParams ) => {
	const { elementId, propertyValue, elementType, customCssWriteMode = 'replace' } = params;
	const propertyName =
		params.propertyName === '_styles'
			? params.propertyName
			: resolveCanonicalPropName( elementType, params.propertyName );
	if ( propertyName === '_styles' ) {
		const elementStyles = getElementStyles( elementId ) || {};
		const propertyMapValue = propertyValue as Record< string, PropValue >;
		const styleSchema = getStylesSchema();
		const transformedStyleValues = Object.fromEntries(
			Object.entries( propertyMapValue ).map( ( [ key, val ] ) => {
				if ( key === 'custom_css' ) {
					return [ key, val ];
				}
				const { key: propKey, kind } = styleSchema?.[ key ] || {};
				if ( ! propKey && kind !== 'union' ) {
					throw new Error( `_styles property ${ key } is not supported.` );
				}
				if ( val === null ) {
					return [ key, null ];
				}
				return [ key, resolvePropValue( val, propKey ) ];
			} )
		);
		const localStyle = Object.values( elementStyles ).find( ( style ) => style.label === 'local' );
		const existingCustomCssText = localStyle
			? readStoredCustomCssText( getVariantByMeta( localStyle, LOCAL_STYLE_META )?.custom_css?.raw )
			: '';
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
				const customCssText =
					customCssWriteMode === 'merge-with-stored'
						? mergeCustomCssText( existingCustomCssText, customCssValue as string )
						: String( customCssValue );
				if ( customCssText ) {
					customCss = {
						raw: btoa( customCssText ),
					};
				} else {
					customCss = { raw: btoa( '' ) };
				}
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
	const { valid, jsonSchema } = Schema.validatePropValue( elementPropSchema[ propertyName ], propertyValue );
	if ( ! valid ) {
		throw new Error(
			`Invalid PropValue for elementId: ${ elementId }. PropKey: ${ propKey }, PropValue: ${ JSON.stringify(
				propertyValue
			) }\nExpected Schema: ${ jsonSchema }`
		);
	}
	updateElementSettings( {
		id: elementId,
		props: {
			[ propertyName ]: value,
		},
		withHistory: false,
	} );
	runCommandSync( 'document/save/set-is-modified', { status: true }, { internal: true } );
};
