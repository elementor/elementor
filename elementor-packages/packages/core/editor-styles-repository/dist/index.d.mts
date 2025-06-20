import { Props } from '@elementor/editor-props';
import * as _elementor_editor_styles from '@elementor/editor-styles';
import { StyleDefinition, StyleDefinitionID, StyleDefinitionVariant } from '@elementor/editor-styles';

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
type Meta = Record<string, unknown>;
type UpdateActionPayload = MakeOptional<StyleDefinition, 'label' | 'variants' | 'type'>;
type UserCapabilities = {
    create: string;
    delete: string;
    update: string;
    updateProps: string;
};
type UpdatePropsActionPayload = {
    id: StyleDefinitionID;
    meta: StyleDefinitionVariant['meta'];
    props: Props;
};
type StylesProvider = {
    getKey: () => string;
    priority: number;
    limit: number;
    subscribe: (callback: () => void) => () => void;
    labels: {
        singular: string | null;
        plural: string | null;
    };
    actions: {
        all: (meta?: Meta) => StyleDefinition[];
        get: (id: StyleDefinitionID, meta?: Meta) => StyleDefinition | null;
        resolveCssName: (id: StyleDefinitionID) => string;
        create?: (label: StyleDefinition['label']) => StyleDefinitionID;
        delete?: (id: StyleDefinitionID) => void;
        update?: (data: UpdateActionPayload) => void;
        updateProps?: (args: UpdatePropsActionPayload, meta?: Meta) => void;
    };
    capabilities?: UserCapabilities;
};

declare const stylesRepository: {
    all: (meta?: Meta) => _elementor_editor_styles.StyleDefinition[];
    register: (provider: StylesProvider) => void;
    subscribe: (cb: () => void) => () => void;
    getProviders: () => StylesProvider[];
    getProviderByKey: (key: string) => StylesProvider | undefined;
};

declare function useProviders(): StylesProvider[];

type CreateAction = Required<StylesProvider['actions']>['create'];
type CreateTuple = [StylesProvider, CreateAction];
declare function useGetStylesRepositoryCreateAction(): CreateTuple | null;

type UserCan = {
    [key in keyof UserCapabilities]: boolean;
};
declare const useUserStylesCapability: () => {
    userCan: (providerKey: string) => UserCan;
};

type ValidationEvent = 'inputChange' | 'create' | 'rename';
type ValidationResult = {
    isValid: true;
    errorMessage: null;
} | {
    isValid: false;
    errorMessage: string;
};
declare function validateStyleLabel(label: string, event: ValidationEvent | 'rename'): ValidationResult;

type CreateStylesProviderOptions = {
    key: string | (() => string);
    priority?: number;
    limit?: number;
    subscribe?: (callback: () => void) => () => void;
    labels?: {
        singular: string;
        plural: string;
    };
    actions: {
        all: StylesProvider['actions']['all'];
        get: StylesProvider['actions']['get'];
        resolveCssName?: StylesProvider['actions']['resolveCssName'];
        create?: StylesProvider['actions']['create'];
        delete?: StylesProvider['actions']['delete'];
        update?: StylesProvider['actions']['update'];
        updateProps?: StylesProvider['actions']['updateProps'];
    };
    capabilities?: UserCapabilities;
};
declare function createStylesProvider({ key, priority, limit, subscribe, labels, actions, capabilities, }: CreateStylesProviderOptions): StylesProvider;

declare function isElementsStylesProvider(key: string): boolean;

declare const ELEMENTS_BASE_STYLES_PROVIDER_KEY = "element-base-styles";

declare const ELEMENTS_STYLES_PROVIDER_KEY_PREFIX = "document-elements-";
declare const ELEMENTS_STYLES_RESERVED_LABEL = "local";

declare function init(): void;

export { type CreateStylesProviderOptions, ELEMENTS_BASE_STYLES_PROVIDER_KEY, ELEMENTS_STYLES_PROVIDER_KEY_PREFIX, ELEMENTS_STYLES_RESERVED_LABEL, type Meta, type StylesProvider, type UpdateActionPayload, type UpdatePropsActionPayload, type UserCapabilities, createStylesProvider, init, isElementsStylesProvider, stylesRepository, useGetStylesRepositoryCreateAction, useProviders, useUserStylesCapability, validateStyleLabel };
