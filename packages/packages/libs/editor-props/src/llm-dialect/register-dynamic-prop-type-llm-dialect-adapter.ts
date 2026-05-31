import { type PropKey, type TransformablePropType, type TransformablePropValue, type UnionPropType } from '../types';
import { type JsonSchema7 } from '../utils/prop-json-schema';
import { createEmptyPropValueForPropType } from './create-empty-prop-value';
import { getLlmDialectDynamicTag } from './dynamic-tag-metadata-registry';
import { dynamicFallbackToHtmlV3, htmlV3ToDynamicFallback, isHtmlV3UnionPropType } from './html-v3-dynamic-fallback';
import { LLMDialectAdapter, type LlmDialectValueContext } from './llm-prop-schema';
import { isUnionWithDynamicPropType } from './prop-type-schema-matchers';
type DynamicPropValue = TransformablePropValue<
	'dynamic',
	{
		name: string;
		group: string;
		settings: Record< string, unknown > & {
			fallback: TransformablePropValue< PropKey, unknown >;
		};
	}
>;

type DynamicPropType = TransformablePropType & {
	settings: {
		categories: string[];
	};
};

const addBindable = ( schema: JsonSchema7, categories: string[] = [] ) => {
	schema.properties = schema.properties || {};
	schema.properties.bindTo = {
		type: 'string',
		description: `refer to elementor://dynamic-tags to see available tags. Allowed categories: ${ categories }`,
	};

	return {
		...schema,
		allowBind: true,
	};
};

const dynamicToDialectValue = ( propValue: Record< string, unknown >, context?: LlmDialectValueContext ) => {
	if ( propValue.$$type !== 'dynamic' ) {
		return propValue;
	}

	const dynamicValue = ( propValue as DynamicPropValue ).value;
	const fallback = dynamicValue?.settings?.fallback || createEmptyPropValueForPropType( context?.propType );

	if ( ! fallback ) {
		return propValue;
	}

	const dialectFallback = isHtmlV3UnionPropType( context?.propType ) ? dynamicFallbackToHtmlV3( fallback ) : fallback;

	return {
		...dialectFallback,
		bindTo: dynamicValue.name,
		allowBind: true,
	};
};

const bindToToPropValue = ( maybeLLMDialectPropValue: Record< string, unknown > ) => {
	if ( typeof maybeLLMDialectPropValue.bindTo !== 'string' ) {
		return maybeLLMDialectPropValue;
	}

	const { bindTo, allowBind: _allowBind, ...rest } = maybeLLMDialectPropValue;
	const fallback =
		typeof rest.$$type === 'string'
			? {
					$$type: rest.$$type,
					value: rest.value,
			  }
			: undefined;
	const tagMetadata = getLlmDialectDynamicTag( bindTo );
	const settings: Record< string, unknown > = {};

	if ( tagMetadata?.label ) {
		settings.label = tagMetadata.label;
	}

	if ( fallback ) {
		settings.fallback = htmlV3ToDynamicFallback( fallback );
	}

	return {
		$$type: 'dynamic',
		value: {
			name: bindTo,
			group: tagMetadata?.group ?? '',
			...( Object.keys( settings ).length > 0 ? { settings } : {} ),
		},
	};
};

export function registerDynamicPropTypeLLMDialectAdapter() {
	LLMDialectAdapter.registerGlobalValueAdapter( {
		toDialectValue: dynamicToDialectValue,
		toPropValue: bindToToPropValue,
	} );

	LLMDialectAdapter.registerSchemaDialect( {
		id: 'union-dynamic',
		matches: isUnionWithDynamicPropType,
		toDialectSchema( schema, propType, context ) {
			if ( context?.allowBindTo === false ) {
				return schema;
			}

			const dynamicPropDefinition = ( propType as UnionPropType ).prop_types?.dynamic as DynamicPropType;
			if ( dynamicPropDefinition ) {
				const categories = dynamicPropDefinition.settings.categories;
				schema.anyOf = schema.anyOf?.map( ( entry ) => addBindable( entry, categories ) );
				schema.allowBind = true;
			}
			return schema;
		},
	} );
}
