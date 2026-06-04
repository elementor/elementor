import { type PropType, type PropValue, type TransformablePropType, type TransformablePropValue } from '../../types';
import { isTransformable } from '../../utils/is-transformable';
import { type JsonSchema7 } from '../../utils/prop-json-schema';
import {
	ALLOW_BIND_KEY,
	BIND_TO_KEY,
	type DialectWireValue,
	hasBindTo,
	stripDialectMarkers,
	stripFallbackSetting,
} from '../dialect-markers';
import { getLlmDialectDynamicTag } from '../dynamic-tag-metadata-registry';
import { getStaticUnionBranch, isUnionWithDynamic } from '../prop-type-nav';
import { type PropDialectAdapter } from '../registry';

const FALLBACK_KEY = 'fallback';

type DynamicPropValue = TransformablePropValue<
	'dynamic',
	{
		name: string;
		group?: string;
		settings?: {
			label?: string;
			fallback?: PropValue;
			categories?: string[];
		};
	}
>;

const isDynamicPropValue = ( value: PropValue ): value is DynamicPropValue =>
	isTransformable( value ) && value.$$type === 'dynamic';

const getDynamicCategories = ( propType: PropType ): string => {
	if ( ! isUnionWithDynamic( propType ) ) {
		return '';
	}

	const dynamicMember = propType.prop_types.dynamic;
	const categories = dynamicMember?.settings?.categories;

	if ( ! Array.isArray( categories ) || categories.length === 0 ) {
		return '';
	}

	return categories.join( ', ' );
};

const createBindToSchema = ( categories: string ): JsonSchema7 => ( {
	type: 'string',
	description: categories ? `Dynamic tag name. Categories: ${ categories }` : 'Dynamic tag name.',
} );

const mergeStaticUnionSchema = ( schema: JsonSchema7, categories: string ): JsonSchema7 => {
	const bindToSchema = createBindToSchema( categories );

	if ( Array.isArray( schema.anyOf ) && schema.anyOf.length > 0 ) {
		return {
			...schema,
			allowBind: true,
			anyOf: schema.anyOf.map( ( branch ) => ( {
				...branch,
				properties: {
					...branch.properties,
					[ BIND_TO_KEY ]: bindToSchema,
				},
			} ) ),
		};
	}

	return {
		...schema,
		allowBind: true,
		properties: {
			...schema.properties,
			[ BIND_TO_KEY ]: bindToSchema,
		},
	};
};

const createEmptyStaticValue = ( staticBranch: TransformablePropType ): PropValue => {
	if ( staticBranch.kind === 'string' ) {
		return { $$type: staticBranch.key ?? 'string', value: '' };
	}

	if ( staticBranch.kind === 'number' ) {
		return { $$type: staticBranch.key ?? 'number', value: 0 };
	}

	if ( staticBranch.kind === 'object' ) {
		return {
			$$type: staticBranch.key,
			value: {},
		};
	}

	return { $$type: staticBranch.key ?? staticBranch.kind, value: null };
};

const enrichDynamicTagMetadata = ( tagName: string, dynamicValue: DynamicPropValue[ 'value' ] ) => {
	const metadata = getLlmDialectDynamicTag( tagName );

	if ( ! metadata ) {
		return dynamicValue;
	}

	return {
		...dynamicValue,
		name: metadata.name,
		group: metadata.group,
		settings: {
			...dynamicValue.settings,
			label: metadata.label,
		},
	};
};

const buildDynamicFromBindTo = ( value: DialectWireValue ): DynamicPropValue => {
	const tagName = value[ BIND_TO_KEY ] as string;
	const stripped = stripDialectMarkers( value );

	return {
		$$type: 'dynamic',
		value: enrichDynamicTagMetadata( tagName, {
			name: tagName,
			settings: {
				fallback: stripped,
			},
		} ),
	};
};

type ControlNode = {
	type?: string;
	value?: {
		bind?: string;
		type?: string;
		items?: ControlNode[];
	};
};

export const findControlTypeByBind = ( controls: ControlNode[] | undefined, bind: string ): string | null => {
	for ( const item of controls ?? [] ) {
		if ( item?.type === 'control' && item.value?.bind === bind ) {
			return item.value.type ?? null;
		}

		const found = findControlTypeByBind( item?.value?.items, bind );

		if ( found ) {
			return found;
		}
	}

	return null;
};

const getFallbackControlType = ( tagName: string ): string | null => {
	const tag = getLlmDialectDynamicTag( tagName ) as { atomic_controls?: ControlNode[] } | undefined;

	return findControlTypeByBind( tag?.atomic_controls, FALLBACK_KEY );
};

const toStringFallback = ( fallback: PropValue ): PropValue => {
	const innerValue = isTransformable( fallback ) ? fallback.value : fallback;

	return { $$type: 'string', value: innerValue } as PropValue;
};

const withFallback = ( value: DynamicPropValue, fallback: PropValue ): DynamicPropValue => ( {
	...value,
	value: {
		...value.value,
		settings: {
			...value.value.settings,
			fallback,
		},
	},
} );

const reconcileFallbackToProp = ( value: DynamicPropValue ): DynamicPropValue => {
	const controlType = getFallbackControlType( value.value.name );

	if ( controlType === null ) {
		return stripFallbackSetting( value );
	}

	if ( controlType !== 'text' ) {
		return value;
	}

	const fallback = value.value.settings?.fallback;

	if ( fallback === undefined || ( isTransformable( fallback ) && fallback.$$type !== 'string' ) ) {
		return value;
	}

	return withFallback( value, toStringFallback( fallback ) );
};

const reconcileFallbackToDialect = ( value: DynamicPropValue, staticBranch: TransformablePropType ): PropValue => {
	const controlType = getFallbackControlType( value.value.name );
	const fallback = value.value.settings?.fallback;

	if ( controlType === null ) {
		return { $$type: staticBranch.key, value: null } as PropValue;
	}

	if ( controlType === 'text' ) {
		const innerValue = isTransformable( fallback ) ? fallback.value : fallback ?? null;

		return { $$type: 'string', value: innerValue } as PropValue;
	}

	return fallback ?? createEmptyStaticValue( staticBranch );
};

export const dynamicLlmDialectAdapter: PropDialectAdapter = {
	id: 'dynamic',
	matches: ( ctx ) => isUnionWithDynamic( ctx.propType ),
	toDialectSchema: ( schema, ctx ) => {
		return mergeStaticUnionSchema( schema, getDynamicCategories( ctx.propType ) );
	},
	toPropValue: ( value ) => {
		if ( isDynamicPropValue( value ) || ! hasBindTo( value ) ) {
			return value;
		}

		return reconcileFallbackToProp( buildDynamicFromBindTo( value ) );
	},
	toDialectValue: ( value, ctx ) => {
		if ( ! isDynamicPropValue( value ) ) {
			return value;
		}

		const staticBranch = getStaticUnionBranch( ctx.propType );
		if ( ! staticBranch ) {
			return value;
		}

		const fallback = reconcileFallbackToDialect( value, staticBranch );

		return {
			...( fallback as TransformablePropValue< string, unknown > ),
			[ BIND_TO_KEY ]: value.value.name,
			[ ALLOW_BIND_KEY ]: true,
		} as PropValue;
	},
};
