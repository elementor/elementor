import * as _elementor_editor_props from '@elementor/editor-props';
import { Props, PropType } from '@elementor/editor-props';
import { BreakpointId } from '@elementor/editor-responsive';

type ClassState = {
    name: 'selected';
    value: 'e--selected';
};
type StyleDefinitionAdditionalPseudoState = 'focus-visible';
type StyleDefinitionPseudoState = 'hover' | 'focus' | 'active' | 'checked' | StyleDefinitionAdditionalPseudoState;
type StyleDefinitionClassState = ClassState['value'];
type StyleDefinitionStateType = StyleDefinitionPseudoState | StyleDefinitionClassState;
type StyleDefinitionState = null | Exclude<StyleDefinitionStateType, StyleDefinitionAdditionalPseudoState>;
type CustomCss = {
    raw: string;
};
type StyleDefinitionVariant = {
    meta: {
        breakpoint: null | BreakpointId;
        state: StyleDefinitionState;
    };
    props: Props;
    custom_css: CustomCss | null;
};
type StyleDefinitionType = 'class';
type StyleDefinitionID = string;
type StyleDefinition = {
    id: StyleDefinitionID;
    variants: StyleDefinitionVariant[];
    label: string;
    type: StyleDefinitionType;
    sync_to_v3?: boolean;
};
type StyleDefinitionsMap = Record<StyleDefinition['id'], StyleDefinition>;

declare function generateId(prefix?: string, existingIds?: string[]): string;

declare const getStylesSchema: () => Record<string, _elementor_editor_props.PropType<{
    key?: string;
}>>;
declare const isExistingStyleProperty: (property: string) => boolean;

declare function getVariantByMeta(style: StyleDefinition, meta: StyleDefinitionVariant['meta']): StyleDefinitionVariant | undefined;

declare function isClassState(state: StyleDefinitionStateType): state is StyleDefinitionClassState;
declare function isPseudoState(state: StyleDefinitionStateType): state is StyleDefinitionPseudoState;
declare function getSelectorWithState(baseSelector: string, state: StyleDefinitionState): string;

type ExtendedWindow = Window & {
    elementor: {
        config: {
            atomic?: {
                styles_schema: Record<string, PropType<{
                    key?: string;
                }>>;
            };
        };
    };
};

export { type ClassState, type CustomCss, type ExtendedWindow, type StyleDefinition, type StyleDefinitionAdditionalPseudoState, type StyleDefinitionClassState, type StyleDefinitionID, type StyleDefinitionPseudoState, type StyleDefinitionState, type StyleDefinitionStateType, type StyleDefinitionType, type StyleDefinitionVariant, type StyleDefinitionsMap, generateId, getSelectorWithState, getStylesSchema, getVariantByMeta, isClassState, isExistingStyleProperty, isPseudoState };
