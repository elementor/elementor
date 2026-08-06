import {
	ANGIE_MODEL_PREFERENCES,
	ANGIE_REQUIRED_RESOURCES,
	type AngieModelPreferences,
	type AngieToolUiMeta,
	createDefaultModelPreferences,
} from './angie-annotations';
import { type ResourceList } from './utils/merge-required-resources';

export type BuildToolMetaArgs = {
	modelPreferences?: AngieModelPreferences;
	requiredResources?: ResourceList;
	ui?: AngieToolUiMeta;
};

export function buildToolMeta( {
	modelPreferences,
	requiredResources,
	ui,
}: BuildToolMetaArgs ): Record< string, unknown > {
	return {
		[ ANGIE_MODEL_PREFERENCES ]: modelPreferences ?? createDefaultModelPreferences(),
		[ ANGIE_REQUIRED_RESOURCES ]: requiredResources,
		...( ui ? { ui } : {} ),
	};
}

export function toCallToolResult( invocationResult: unknown ): {
	structuredContent?: unknown;
	content: Array< { type: 'text'; text: string } >;
} {
	return {
		structuredContent: typeof invocationResult === 'string' ? undefined : invocationResult,
		content: [
			{
				type: 'text',
				text:
					typeof invocationResult === 'string' ? invocationResult : JSON.stringify( invocationResult ),
			},
		],
	};
}
