import {
	type ObjectPropType,
	type PropKey,
	type PropType,
	type PropValue,
	type TransformablePropType,
	type TransformablePropValue,
	type UnionPropType,
} from '../types';
import { getPropSchemaFromCache } from '../utils/create-prop-utils';
import { type JsonSchema7 } from '../utils/prop-json-schema';
import { getLlmDialectDynamicTag } from './dynamic-tag-metadata-registry';
import { dynamicFallbackToHtmlV3, htmlV3ToDynamicFallback, isHtmlV3UnionPropType } from './html-v3-dynamic-fallback';
import { LLMDialectAdapter, type LlmDialectValueContext } from './llm-prop-schema';

type DynamicPropValue = TransformablePropValue<
	'dynamic',
	{
		name: string;
		group: string;
		settings?: Record< string, unknown > & {
			fallback?: TransformablePropValue< PropKey, unknown >;
		};
	}
>;

type DynamicPropType = TransformablePropType & {
	settings: {
		categories: string[];
	};
};

const STATIC_UNION_MEMBER_KEYS = new Set( [ 'dynamic', 'overridable' ] );

const isUnionWithDynamicPropType = ( propType: PropType ): propType is UnionPropType =>
	propType.kind === 'union' && Boolean( ( propType as UnionPropType ).prop_types?.dynamic );

const getStaticUnionBranch = ( propType: UnionPropType ): PropType | undefined => {
	return Object.entries( propType.prop_types || {} ).find(
		( [ key ] ) => ! STATIC_UNION_MEMBER_KEYS.has( key )
	)?.[ 1 ];
};

const createEmptyValueForLeafPropType = ( propType: PropType & { key: string } ): PropValue => {
	if ( propType.initial_value !== null && propType.initial_value !== undefined ) {
		return structuredClone( propType.initial_value ) as PropValue;
	}

	const propUtil = getPropSchemaFromCache( propType.key );
	if ( propUtil ) {
		switch ( propType.kind ) {
			case 'string':
				return propUtil.create( '' );
			case 'number':
				return propUtil.create( null );
			case 'boolean':
				return propUtil.create( null );
			default:
				break;
		}
	}

	switch ( propType.kind ) {
		case 'string':
			return { $$type: propType.key, value: '' };
		case 'number':
			return { $$type: propType.key, value: null };
		case 'boolean':
			return { $$type: propType.key, value: null };
		default:
			return { $$type: propType.key, value: null };
	}
};

const createEmptyPropValueForPropType = ( propType: PropType | undefined ): PropValue | undefined => {
	if ( ! propType ) {
		return undefined;
	}

	if ( propType.kind === 'union' ) {
		const staticBranch = getStaticUnionBranch( propType as UnionPropType );
		return staticBranch ? createEmptyPropValueForPropType( staticBranch ) : undefined;
	}

	if ( propType.kind === 'object' ) {
		const shape = ( propType as ObjectPropType ).shape || {};
		return {
			$$type: propType.key,
			value: Object.fromEntries(
				Object.entries( shape ).map( ( [ key, childPropType ] ) => [
					key,
					createEmptyPropValueForPropType( childPropType ),
				] )
			),
		};
	}

	if ( propType.kind === 'array' ) {
		return { $$type: propType.key, value: [] };
	}

	return createEmptyValueForLeafPropType( propType as PropType & { key: string } );
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

const dynamicToDialectValue = (
	propValue: TransformablePropValue< string, unknown >,
	context?: LlmDialectValueContext
): TransformablePropValue< string, unknown > => {
	if ( propValue.$$type !== 'dynamic' ) {
		return propValue;
	}

	const dynamicValue = ( propValue as DynamicPropValue ).value;
	const fallback = dynamicValue?.settings?.fallback || createEmptyPropValueForPropType( context?.propType );

	if ( ! fallback ) {
		return propValue;
	}

	const dialectFallback = isHtmlV3UnionPropType( context?.propType ) ? dynamicFallbackToHtmlV3( fallback ) : fallback;

	if ( typeof dialectFallback !== 'object' || dialectFallback === null || ! ( '$$type' in dialectFallback ) ) {
		return propValue;
	}

	return {
		...dialectFallback,
		bindTo: dynamicValue.name,
		allowBind: true,
	} as TransformablePropValue< string, unknown >;
};

const normalizeDynamicFallback = ( fallback: PropValue ): PropValue =>
	htmlV3ToDynamicFallback( LLMDialectAdapter.applyRegisteredTypeDialect( fallback ) );

const bindToToPropValue = ( maybeLLMDialectPropValue: TransformablePropValue< string, unknown > ): DynamicPropValue => {
	const dialectValue = maybeLLMDialectPropValue as TransformablePropValue< string, unknown > & {
		bindTo?: string;
		allowBind?: boolean;
	};

	if ( typeof dialectValue.bindTo !== 'string' ) {
		return maybeLLMDialectPropValue as DynamicPropValue;
	}

	const { bindTo, allowBind: _allowBind, ...rest } = dialectValue;
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
		settings.fallback = normalizeDynamicFallback( fallback as PropValue );
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

const dynamicToCanonicalPropValue = ( propValue: TransformablePropValue< string, unknown > ): DynamicPropValue => {
	if ( propValue.$$type !== 'dynamic' ) {
		return propValue as DynamicPropValue;
	}

	const dynamicValue = ( propValue as DynamicPropValue ).value;
	const fallback = dynamicValue?.settings?.fallback;

	if ( ! fallback ) {
		return propValue as DynamicPropValue;
	}

	return {
		$$type: 'dynamic',
		value: {
			...dynamicValue,
			settings: {
				...dynamicValue.settings,
				fallback: normalizeDynamicFallback( fallback as PropValue ) as TransformablePropValue<
					PropKey,
					unknown
				>,
			},
		},
	};
};

export function registerDynamicPropTypeLLMDialectAdapter() {
	LLMDialectAdapter.registerGlobalValueAdapter( {
		toDialectValue: dynamicToDialectValue,
		toPropValue: bindToToPropValue,
	} );

	LLMDialectAdapter.register( 'dynamic', {
		toPropValue: dynamicToCanonicalPropValue,
		toDialectValue: ( propValue ) => propValue,
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
