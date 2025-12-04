import {
	createElementStyle,
	getElementStyles,
	getWidgetsCache,
	updateElementSettings,
	updateElementStyle,
} from '@elementor/editor-elements';
import {
	getPropSchemaFromCache,
	type PropValue,
	Schema,
	stringPropTypeUtil,
	type TransformablePropValue,
} from '@elementor/editor-props';
import { type CustomCss, getStylesSchema } from '@elementor/editor-styles';

type OwnParams = {
	elementId: string;
	elementType: string;
	propertyName: string;
	propertyValue: string | PropValue | TransformablePropValue< string, unknown >;
};

function resolvePropValue( value: unknown, forceKey?: string ): PropValue {
	return Schema.adjustLlmPropValueSchema( value as PropValue, { forceKey } );
}

export const doUpdateElementProperty = ( params: OwnParams ) => {
	const { elementId, propertyName, propertyValue, elementType } = params;

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
				return [ key, resolvePropValue( val, propKey ) ];
			} )
		);
		let customCss: CustomCss | undefined;
		Object.keys( propertyMapValue as Record< string, unknown > ).forEach( ( stylePropName ) => {
			const propertyRawSchema = styleSchema[ stylePropName ];
			if ( stylePropName === 'custom_css' ) {
				let customCssValue = propertyMapValue[ stylePropName ] as object | string;
				if ( typeof customCssValue === 'object' ) {
					customCssValue =
						stringPropTypeUtil.extract( customCssValue ) ||
						( customCssValue as { value: unknown } )?.value ||
						'';
				}
				customCss = {
					raw: btoa( customCssValue as string ),
				};
				return;
			}
			const isSupported = !! propertyRawSchema;
			if ( ! isSupported ) {
				throw new Error( `_styles property ${ stylePropName } is not supported.` );
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
	const value = resolvePropValue( propertyValue );
	updateElementSettings( {
		id: elementId,
		props: {
			[ propertyName ]: value,
		},
		withHistory: false,
	} );
};
