import { PropsSchema, PropValue, Props } from '@elementor/editor-props';
import { StyleDefinitionID, StyleDefinition, StyleDefinitionVariant } from '@elementor/editor-styles';
import * as _elementor_editor_v1_adapters from '@elementor/editor-v1-adapters';

type ElementID = string;
type Element = {
    id: ElementID;
    type: string;
};
type ElementType = {
    key: string;
    controls: ControlItem[];
    propsSchema: PropsSchema;
    title: string;
};
type ControlsSection = {
    type: 'section';
    value: {
        description?: string;
        label: string;
        items: ControlItem[];
    };
};
type Control = {
    type: 'control';
    value: {
        bind: string;
        label?: string;
        description?: string;
        type: string;
        props: Record<string, unknown>;
        meta?: {
            layout?: ControlLayout;
            topDivider?: boolean;
        };
    };
};
type ControlItem = ControlsSection | Control;
type ControlLayout = 'full' | 'two-columns' | 'custom';

type V1Element = {
    id: string;
    model: V1Model<V1ElementModelProps>;
    settings: V1Model<V1ElementSettingsProps>;
    children?: V1Element[];
    view?: {
        el?: HTMLElement;
        getDomElement?: () => {
            get?: (index: number) => HTMLElement | undefined;
        };
    };
    parent?: V1Element;
};
type V1ElementModelProps = {
    widgetType?: string;
    elType: string;
    id: string;
    styles?: Record<StyleDefinitionID, StyleDefinition>;
    elements?: V1Model<V1ElementModelProps>[];
};
type V1ElementSettingsProps = Record<string, PropValue>;
type V1ElementConfig = {
    title: string;
    controls: object;
    atomic?: boolean;
    atomic_controls?: ControlItem[];
    atomic_props_schema?: PropsSchema;
    twig_templates?: Record<string, string>;
    twig_main_template?: string;
    base_styles?: Record<string, StyleDefinition>;
    base_styles_dictionary?: Record<string, string>;
};
type V1Model<T> = {
    get: <K extends keyof T>(key: K) => T[K];
    set: <K extends keyof T>(key: K, value: T[K]) => void;
    toJSON: () => T;
};

declare const useElementSetting: <TValue>(elementId: ElementID, settingKey: string) => TValue | null;
declare const useElementSettings: <TValue>(elementId: ElementID, settingKeys: string[]) => Record<string, TValue>;

declare function useElementType(type?: string): ElementType | null;

declare function useSelectedElement(): {
    element: null;
    elementType: null;
} | {
    element: Element;
    elementType: ElementType;
};

declare function useParentElement(elementId: string | null): V1Element | null | undefined;

declare function getContainer(id: string): V1Element | null;
declare const selectElement: (elementId: string) => void;

declare const getElementSetting: <TValue>(elementId: ElementID, settingKey: string) => TValue | null;

declare const getElementStyles: (elementID: ElementID) => Record<string, StyleDefinition> | null;

declare function getElementLabel(elementId: ElementID): string;

declare function getElements(root?: ElementID): V1Element[];

declare function getCurrentDocumentId(): number | null;

declare function getSelectedElements(): Element[];

declare function getWidgetsCache(): Record<string, V1ElementConfig> | null;

type UpdateElementSettingsArgs = {
    id: ElementID;
    props: Props;
    withHistory?: boolean;
};
declare const updateElementSettings: ({ id, props, withHistory }: UpdateElementSettingsArgs) => void;

declare const ELEMENT_STYLE_CHANGE_EVENT = "elementor/editor-v2/editor-elements/style";
declare const styleRerenderEvents: (_elementor_editor_v1_adapters.CommandEventDescriptor | _elementor_editor_v1_adapters.WindowEventDescriptor)[];

type CreateElementStyleArgs = {
    styleId?: StyleDefinitionID;
    elementId: ElementID;
    classesProp: string;
    label: string;
    meta: StyleDefinitionVariant['meta'];
    props: StyleDefinitionVariant['props'];
    additionalVariants?: StyleDefinitionVariant[];
};
declare function createElementStyle({ styleId, elementId, classesProp, label, meta, props, additionalVariants, }: CreateElementStyleArgs): string;

type UpdateElementStyleArgs = {
    elementId: ElementID;
    styleId: StyleDefinition['id'];
    meta: StyleDefinitionVariant['meta'];
    props: StyleDefinitionVariant['props'];
};
declare function updateElementStyle(args: UpdateElementStyleArgs): void;

declare function deleteElementStyle(elementId: ElementID, styleId: StyleDefinitionID): void;

type LinkInLinkRestriction = {
    shouldRestrict: true;
    reason: 'ancestor' | 'descendant';
    elementId: string | null;
} | {
    shouldRestrict: false;
    reason?: never;
    elementId?: never;
};
declare function getLinkInLinkRestriction(elementId: string): LinkInLinkRestriction;
declare function getAnchoredDescendantId(elementId: string): string | null;
declare function getAnchoredAncestorId(elementId: string): string | null;
declare function isElementAnchored(elementId: string): boolean;

export { type Control, type ControlItem, type ControlLayout, type ControlsSection, type CreateElementStyleArgs, ELEMENT_STYLE_CHANGE_EVENT, type Element, type ElementID, type ElementType, type LinkInLinkRestriction, type UpdateElementSettingsArgs, type UpdateElementStyleArgs, type V1Element, type V1ElementConfig, type V1ElementModelProps, type V1ElementSettingsProps, createElementStyle, deleteElementStyle, getAnchoredAncestorId, getAnchoredDescendantId, getContainer, getCurrentDocumentId, getElementLabel, getElementSetting, getElementStyles, getElements, getLinkInLinkRestriction, getSelectedElements, getWidgetsCache, isElementAnchored, selectElement, styleRerenderEvents, updateElementSettings, updateElementStyle, useElementSetting, useElementSettings, useElementType, useParentElement, useSelectedElement };
