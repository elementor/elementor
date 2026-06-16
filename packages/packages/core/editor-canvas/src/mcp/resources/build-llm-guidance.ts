import { type V1ElementConfig } from '@elementor/editor-elements';
import { type Props, type PropValue } from '@elementor/editor-props';

import { getRequiredDefaultChildTypes } from '../../composition-builder/utils/required-default-child-tags';

const DEFAULT_STYLES_INSTRUCTION = 'These are the default styles applied to the widget. Override only when necessary.';

const DEFAULT_SETTINGS_INSTRUCTION =
	'These are the default settings applied to the widget. Omit them from elementConfig unless the user explicitly asks to change them.';

const BASE_SETTING_PROP_HINT =
	'Has a widget default — omit unless user explicitly requests a change. See llm_guidance.default_settings.';

export type LlmGuidance = Record< string, unknown >;

export type JsonSchemaProperty = {
	description?: string;
	[ key: string ]: unknown;
};

export function mergeInstructions( existing: unknown, additional: string ): string {
	if ( typeof existing === 'string' && existing.length > 0 ) {
		return `${ existing } ${ additional }`;
	}

	return additional;
}

export function enrichPropertiesWithBaseSettingsHints(
	properties: Record< string, JsonSchemaProperty >,
	baseSettingsKeys: string[]
): Record< string, JsonSchemaProperty > {
	if ( ! baseSettingsKeys.length ) {
		return properties;
	}

	const enriched: Record< string, JsonSchemaProperty > = { ...properties };

	for ( const key of baseSettingsKeys ) {
		const propSchema = enriched[ key ];

		if ( ! propSchema ) {
			continue;
		}

		enriched[ key ] = {
			...propSchema,
			description: propSchema.description
				? `${ propSchema.description } ${ BASE_SETTING_PROP_HINT }`
				: BASE_SETTING_PROP_HINT,
		};
	}

	return enriched;
}

export function buildLlmGuidance(
	widgetData: V1ElementConfig,
	widgetType: string,
	allWidgets: Record< string, V1ElementConfig >
): LlmGuidance {
	const defaultStyles: Record< string, Props > = {};
	const baseStyleSchema = widgetData?.base_styles;

	if ( baseStyleSchema ) {
		Object.values( baseStyleSchema ).forEach( ( stylePropType ) => {
			stylePropType.variants.forEach( ( variant ) => {
				Object.assign( defaultStyles, variant.props );
			} );
		} );
	}

	const baseSettings = ( widgetData?.base_settings ?? {} ) as Record< string, PropValue >;
	const hasDefaultStyles = Object.keys( defaultStyles ).length > 0;
	const hasDefaultSettings = Object.keys( baseSettings ).length > 0;

	const llmGuidance: LlmGuidance = {
		can_have_children: !! widgetData?.meta?.is_container,
	};

	if ( hasDefaultStyles ) {
		llmGuidance.instructions = DEFAULT_STYLES_INSTRUCTION;
		llmGuidance.default_styles = defaultStyles;
	}

	if ( hasDefaultSettings ) {
		llmGuidance.instructions = mergeInstructions( llmGuidance.instructions, DEFAULT_SETTINGS_INSTRUCTION );
		llmGuidance.default_settings = baseSettings;
	}

	const allowedChildTypes = widgetData.allowed_child_types;
	const allowedParents = Object.entries( allWidgets )
		.filter( ( [ , parentConfig ] ) => parentConfig.allowed_child_types?.includes( widgetType ) )
		.map( ( [ parentType ] ) => parentType );

	if ( allowedChildTypes?.length || allowedParents.length ) {
		llmGuidance.nesting = {
			...( allowedChildTypes?.length ? { allowed_child_types: allowedChildTypes } : {} ),
			...( allowedParents.length ? { allowed_parents: allowedParents } : {} ),
		};
	}

	const requiredDirectChildTags = getRequiredDefaultChildTypes( widgetData );

	if ( requiredDirectChildTags.length ) {
		llmGuidance.required_direct_children = requiredDirectChildTags;
	}

	return llmGuidance;
}
