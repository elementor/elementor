import * as _elementor_editor_props from '@elementor/editor-props';
import { Props } from '@elementor/editor-props';
import { BreakpointId } from '@elementor/editor-responsive';

type StyleDefinitionState = null | 'hover' | 'focus' | 'active' | 'visited' | 'disabled' | 'checked' | 'selected' | 'hidden' | 'visible';
type StyleDefinitionVariant = {
    meta: {
        breakpoint: null | BreakpointId;
        state: StyleDefinitionState;
    };
    props: Props;
};
type StyleDefinitionType = 'class';
type StyleDefinitionID = string;
type StyleDefinition = {
    id: StyleDefinitionID;
    variants: StyleDefinitionVariant[];
    label: string;
    type: StyleDefinitionType;
};
type StyleDefinitionsMap = Record<StyleDefinition['id'], StyleDefinition>;

declare function generateId(prefix?: string, existingIds?: string[]): string;

declare const getStylesSchema: () => Record<string, _elementor_editor_props.PropType>;

declare function getVariantByMeta(style: StyleDefinition, meta: StyleDefinitionVariant['meta']): StyleDefinitionVariant | undefined;

export { type StyleDefinition, type StyleDefinitionID, type StyleDefinitionState, type StyleDefinitionType, type StyleDefinitionVariant, type StyleDefinitionsMap, generateId, getStylesSchema, getVariantByMeta };
