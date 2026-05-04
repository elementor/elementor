import { type StyleDefinitionID, type StyleDefinitionsMap, type StyleVariables } from '@elementor/editor-styles';

export const GLOBAL_STYLES_IMPORTED_EVENT = 'elementor/global-styles/imported';

export type ImportedGlobalStylesPayload = {
	global_variables?: { data: StyleVariables };
	global_classes?: { items: StyleDefinitionsMap; order: StyleDefinitionID[] };
};
