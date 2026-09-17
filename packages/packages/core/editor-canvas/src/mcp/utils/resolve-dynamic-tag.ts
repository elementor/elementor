import { type PropType, type PropValue } from '@elementor/editor-props';
import { getElementorConfig } from '@elementor/editor-v1-adapters';

export const DYNAMIC_PROP_TYPE_KEY = 'dynamic';

// `fallback` is a generic render-time default added to every tag; it is noise for configuration.
export const OMITTED_DYNAMIC_SETTING_KEYS = [ 'fallback' ] as const;

type SettingPropType = PropType & { key?: string };

export type AtomicDynamicTag = {
	name: string;
	label: string;
	group: string;
	categories: string[];
	props_schema: Record< string, SettingPropType >;
};

type LlmDynamicValue = {
	name?: string;
	settings?: Record< string, unknown >;
};

export const getAtomicDynamicTags = (): Record< string, AtomicDynamicTag > => {
	const config = getElementorConfig() as { atomicDynamicTags?: { tags?: Record< string, AtomicDynamicTag > } };
	return config.atomicDynamicTags?.tags ?? {};
};

export const getDynamicTagNamesByCategories = ( categories: string[] ): string[] => {
	if ( ! categories.length ) {
		return [];
	}
	const wanted = new Set( categories );
	return Object.values( getAtomicDynamicTags() )
		.filter( ( tag ) => tag.categories?.some( ( category ) => wanted.has( category ) ) )
		.map( ( tag ) => tag.name );
};

// Reconstructs an intact dynamic PropValue from whatever the LLM produced: the authoritative `group`
// is taken from the registry (never trusted from the model) and `settings` are rebuilt strictly from
// the tag's props schema (provided values are wrapped, omitted ones fall back to their defaults).
export const dynamicTagLLMResolver = ( value: unknown ): PropValue => {
	const input = ( value ?? {} ) as LlmDynamicValue;
	const tag = input.name ? getAtomicDynamicTags()[ input.name ] : undefined;

	if ( ! tag ) {
		return {
			$$type: DYNAMIC_PROP_TYPE_KEY,
			value: { name: input.name ?? '', group: '', settings: {} },
		} as PropValue;
	}

	return {
		$$type: DYNAMIC_PROP_TYPE_KEY,
		value: {
			name: tag.name,
			group: tag.group,
			settings: buildStrictSettings( tag.props_schema ?? {}, input.settings ?? {} ),
		},
	} as PropValue;
};

const buildStrictSettings = (
	schema: Record< string, SettingPropType >,
	provided: Record< string, unknown >
): Record< string, unknown > => {
	const settings: Record< string, unknown > = {};

	for ( const [ key, propType ] of Object.entries( schema ) ) {
		if ( ( OMITTED_DYNAMIC_SETTING_KEYS as readonly string[] ).includes( key ) ) {
			continue;
		}

		const resolved =
			provided[ key ] !== undefined
				? wrapSettingValue( provided[ key ], propType )
				: defaultSettingValue( propType );

		if ( resolved !== undefined && resolved !== null ) {
			settings[ key ] = resolved;
		}
	}

	return settings;
};

const wrapSettingValue = ( raw: unknown, propType: SettingPropType ): unknown => {
	if ( raw !== null && typeof raw === 'object' ) {
		return raw;
	}
	return propType.key ? { $$type: propType.key, value: raw } : raw;
};

const defaultSettingValue = ( propType: SettingPropType ): unknown => {
	if ( propType.initial_value !== null && propType.initial_value !== undefined ) {
		return propType.initial_value;
	}
	if ( propType.default !== null && propType.default !== undefined ) {
		return wrapSettingValue( propType.default, propType );
	}
	return undefined;
};
