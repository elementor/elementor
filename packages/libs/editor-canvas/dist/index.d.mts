import { V1Element, V1ElementConfig, V1ElementModelProps } from '@elementor/editor-elements';
import { TwingArrayLoader, TwingEnvironment } from '@elementor/twing';
import * as _elementor_editor_props from '@elementor/editor-props';
import { Props, PropValue, PropType, PropTypeKey, PropsSchema, AnyTransformable } from '@elementor/editor-props';
import * as _elementor_utils from '@elementor/utils';
import { StyleDefinitionState } from '@elementor/editor-styles';

declare const BREAKPOINTS_SCHEMA_URI = "elementor://breakpoints/list";

declare const WIDGET_SCHEMA_URI = "elementor://widgets/schema/{widgetType}";
declare const STYLE_SCHEMA_URI = "elementor://styles/schema/{category}";

declare function init(): void;

declare function isAtomicWidget(container: V1Element | undefined): boolean;

type DomRenderer = {
    register: TwingArrayLoader['setTemplate'];
    render: TwingEnvironment['render'];
};

type RenderContext<T = unknown> = Record<string, T>;
type NamespacedRenderContext<T = RenderContext> = Record<string, T | undefined>;
type LegacyWindow = Window & {
    jQuery: JQueryStatic;
    elementor: {
        config: {
            user: {
                is_administrator?: boolean;
            };
        };
        createBackboneElementsCollection: (children: unknown) => BackboneCollection<ElementModel>;
        getElementData: (model: unknown) => {
            title: string;
        };
        modules: {
            elements: {
                types: {
                    Widget: typeof ElementType;
                    Base: typeof ElementType;
                };
                views: {
                    Widget: typeof ElementView;
                    createAtomicElementBase: (type: string) => typeof ElementView & MarionetteExtendable<ElementView>;
                };
                models: {
                    AtomicElementBase: BackboneModelConstructor<ElementModel>;
                };
            };
        };
        elementsManager: {
            registerElementType: (type: ElementType) => void;
            getElementTypeClass: (type: string) => typeof ElementType | undefined;
            _elementTypes: Record<string, ElementType>;
        };
        $preview: JQueryElement & [
            {
                contentWindow: {
                    dispatchEvent: (event: Event) => void;
                };
            }
        ];
        $previewWrapper: JQueryElement;
        helpers: {
            hasPro: () => boolean;
        };
    };
};
type JQueryStatic = (html: string) => JQueryElement;
declare class ElementType {
    getType(): string;
    getView(): typeof ElementView;
}
type MarionetteExtendable<TBase = unknown> = {
    extend: <TExtended extends object>(properties: TExtended & ThisType<TBase & TExtended>) => TBase & TExtended & MarionetteExtendable<TBase & TExtended>;
};
declare class ElementView {
    getChildType(): string[];
    container: V1Element;
    $el: JQueryElement;
    el: HTMLElement;
    model: BackboneModel<ElementModel>;
    collection: BackboneCollection<ElementModel>;
    children: {
        length: number;
        findByIndex: (index: number) => ElementView;
        each: (callback: (view: ElementView) => void) => void;
        map: <T>(callback: (view: ElementView) => T) => T[];
    };
    constructor(...args: unknown[]);
    onRender(...args: unknown[]): void;
    onDestroy(...args: unknown[]): void;
    attributes(): Record<string, unknown>;
    behaviors(): Record<string, unknown>;
    getDomElement(): JQueryElement;
    getHandlesOverlay(): JQueryElement | null;
    setElement(element: JQueryElement): void;
    dispatchPreviewEvent(eventType: string): void;
    getContextMenuGroups(): ContextMenuGroup[];
    /**
     * Templated view methods:
     */
    getTemplateType(): string;
    renderOnChange(): void;
    render(): void;
    _renderTemplate(): void;
    _renderChildren(): void;
    _beforeRender(): void;
    _afterRender(): void;
    attachBuffer(collectionView: this, buffer: DocumentFragment): void;
    triggerMethod(method: string, ...args: unknown[]): void;
    bindUIElements(): void;
    _ensureViewIsIntact(): void;
    _isRendering: boolean;
    resetChildViewContainer(): void;
    childViewContainer: string;
    isRendered: boolean;
    _currentRenderPromise?: Promise<void>;
    options?: {
        model: BackboneModel<ElementModel>;
    };
    ui(): Record<string, unknown>;
    events(): Record<string, unknown>;
    _parent?: ElementView;
    getRenderContext(): NamespacedRenderContext | undefined;
    getResolverRenderContext(): RenderContext | undefined;
    getNamespaceKey(): string;
    invalidateRenderCache(): void;
    _openEditingPanel(options?: {
        scrollIntoView: boolean;
    }): void;
    once: (event: string, callback: () => void) => void;
}
type JQueryElement = {
    find: (selector: string) => JQueryElement;
    html: (html: string) => void;
    get: (index: number) => HTMLElement | undefined;
    attr: {
        (name: string): string;
        (name: string, value: string): JQueryElement;
    };
    prepend: (element: JQueryElement) => JQueryElement;
    on: (event: string, childrenSelectors: string, handler: (event: Event) => void) => void;
    off: (event: string, childrenSelectors: string, handler?: (event: Event) => void) => void;
};
type BackboneModel<Model extends object> = {
    cid?: string;
    get: <T extends keyof Model>(key: T) => Model[T];
    set: <T extends keyof Model>(key: T, value: Model[T]) => void;
    toJSON: () => ToJSON<Model>;
    trigger: (event: string, ...args: unknown[]) => void;
};
type BackboneModelConstructor<Model extends object> = {
    new (...args: unknown[]): BackboneModel<Model>;
    extend: <ExtendedModel extends object>(properties: Record<string, unknown>) => BackboneModelConstructor<ExtendedModel>;
    prototype: {
        initialize: (attributes: unknown, options: unknown) => void;
    };
    getModel: () => BackboneModelConstructor<Model>;
};
type BackboneCollection<Model extends object> = {
    models: BackboneModel<Model>[];
    forEach: (callback: (model: BackboneModel<Model>) => void) => void;
};
type ElementModel = {
    id: string;
    elType: string;
    settings: BackboneModel<Props>;
    editor_settings: Record<string, unknown>;
    widgetType: string;
    editSettings?: BackboneModel<{
        inactive?: boolean;
    }>;
    elements?: BackboneCollection<ElementModel>;
    config: {
        allowed_child_types?: string[];
    };
};
type ToJSON<T> = {
    [K in keyof T]: T[K] extends BackboneModel<infer M> ? ToJSON<M> : T[K];
};
type ContextMenuGroup = {
    name: string;
    actions: ContextMenuAction[];
};
type ContextMenuAction = {
    name: string;
    icon: string;
    title: string | (() => string);
    shortcut?: string;
    isEnabled: () => boolean;
    callback: (_: unknown, eventData: unknown) => void;
};
type ReplacementSettings = {
    getSetting: (key: string) => unknown;
    setSetting: (key: string, value: PropValue) => void;
    type: string;
    id: string;
    element: HTMLElement;
    refreshView: () => void;
};

type CreateTemplatedElementTypeOptions = {
    type: string;
    renderer: DomRenderer;
    element: TemplatedElementConfig;
};
type TemplatedElementConfig = Required<Pick<V1ElementConfig, 'twig_templates' | 'twig_main_template' | 'atomic_props_schema' | 'base_styles_dictionary'>>;
declare function createTemplatedElementView({ type, renderer, element, }: CreateTemplatedElementTypeOptions): typeof ElementView;

type NestedTemplatedElementConfig = TemplatedElementConfig & {
    allowed_child_types?: string[];
    support_nesting: boolean;
};
type ModelExtensions = Record<string, unknown>;
type CreateNestedTemplatedElementTypeOptions = {
    type: string;
    renderer: DomRenderer;
    element: NestedTemplatedElementConfig;
    modelExtensions?: ModelExtensions;
};
declare function canBeNestedTemplated(element: Partial<NestedTemplatedElementConfig>): element is NestedTemplatedElementConfig;
declare function createNestedTemplatedElementType({ type, renderer, element, modelExtensions, }: CreateNestedTemplatedElementTypeOptions): typeof ElementType;
type CreateNestedTemplatedElementViewOptions = Omit<CreateNestedTemplatedElementTypeOptions, 'modelExtensions'>;
declare function createNestedTemplatedElementView({ type, renderer, element, }: CreateNestedTemplatedElementViewOptions): typeof ElementView;

type ElementLegacyType = {
    [key: string]: (options: CreateTemplatedElementTypeOptions) => typeof ElementType;
};
declare function registerModelExtensions(type: string, extensions: ModelExtensions): void;
declare function registerElementType(type: string, elementTypeGenerator: ElementLegacyType[keyof ElementLegacyType]): void;

type TransformerOptions<TContext extends RenderContext = RenderContext> = {
    key: string;
    signal?: AbortSignal;
    renderContext?: TContext;
    propType?: PropType;
};
type UnbrandedTransformer<TValue> = (value: TValue, options: TransformerOptions) => unknown;
type Transformer<TValue> = UnbrandedTransformer<TValue> & {
    __transformer: true;
};
type AnyTransformer = Transformer<any>;

type TransformersRegistry = ReturnType<typeof createTransformersRegistry>;
declare function createTransformersRegistry(): {
    register(type: PropTypeKey, transformer: AnyTransformer): /*elided*/ any;
    registerFallback(transformer: AnyTransformer): /*elided*/ any;
    get(type: PropTypeKey): AnyTransformer | null;
    all(): {
        [x: string]: AnyTransformer;
    };
};
declare const stylesInheritanceTransformersRegistry: {
    register(type: PropTypeKey, transformer: AnyTransformer): /*elided*/ any;
    registerFallback(transformer: AnyTransformer): /*elided*/ any;
    get(type: PropTypeKey): AnyTransformer | null;
    all(): {
        [x: string]: AnyTransformer;
    };
};

type CreatePropResolverArgs = {
    transformers: TransformersRegistry;
    schema: PropsSchema;
    onPropResolve?: (args: {
        key: string;
        value: unknown;
    }) => void;
};
type ResolveArgs = {
    props: Props;
    schema?: PropsSchema;
    signal?: AbortSignal;
    renderContext?: RenderContext;
};
type ResolvedProps = Record<string, unknown>;
type PropsResolver = ReturnType<typeof createPropsResolver>;
declare function createPropsResolver({ transformers, schema: initialSchema, onPropResolve }: CreatePropResolverArgs): ({ props, schema, signal, renderContext }: ResolveArgs) => Promise<ResolvedProps>;

declare const settingsTransformersRegistry: {
    register(type: _elementor_editor_props.PropTypeKey, transformer: AnyTransformer): /*elided*/ any;
    registerFallback(transformer: AnyTransformer): /*elided*/ any;
    get(type: _elementor_editor_props.PropTypeKey): AnyTransformer | null;
    all(): {
        [x: string]: AnyTransformer;
    };
};

declare const styleTransformersRegistry: {
    register(type: _elementor_editor_props.PropTypeKey, transformer: AnyTransformer): /*elided*/ any;
    registerFallback(transformer: AnyTransformer): /*elided*/ any;
    get(type: _elementor_editor_props.PropTypeKey): AnyTransformer | null;
    all(): {
        [x: string]: AnyTransformer;
    };
};

declare const endDragElementFromPanel: () => void;
declare const startDragElementFromPanel: (props: Omit<V1ElementModelProps, "id">, event: React.DragEvent) => void;

declare const DOCUMENT_STRUCTURE_URI = "elementor://document/structure";

declare function createTransformer<TValue = never>(cb: TValue extends AnyTransformable ? 'Transformable values are invalid, use the actual value instead.' : UnbrandedTransformer<TValue>): Transformer<NoInfer<TValue>>;

declare const UnknownStyleTypeError: {
    new ({ cause, context }?: {
        cause?: _elementor_utils.ElementorErrorOptions["cause"];
        context?: {
            type: string;
        } | undefined;
    } | undefined): {
        readonly context: _elementor_utils.ElementorErrorOptions["context"];
        readonly code: _elementor_utils.ElementorErrorOptions["code"];
        name: string;
        message: string;
        stack?: string;
        cause?: unknown;
    };
    isError(error: unknown): error is Error;
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
    prepareStackTrace(err: Error, stackTraces: NodeJS.CallSite[]): any;
    stackTraceLimit: number;
};
declare const UnknownStyleStateError: {
    new ({ cause, context }?: {
        cause?: _elementor_utils.ElementorErrorOptions["cause"];
        context?: {
            state: StyleDefinitionState;
        } | undefined;
    } | undefined): {
        readonly context: _elementor_utils.ElementorErrorOptions["context"];
        readonly code: _elementor_utils.ElementorErrorOptions["code"];
        name: string;
        message: string;
        stack?: string;
        cause?: unknown;
    };
    isError(error: unknown): error is Error;
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
    prepareStackTrace(err: Error, stackTraces: NodeJS.CallSite[]): any;
    stackTraceLimit: number;
};

export { type AnyTransformer, BREAKPOINTS_SCHEMA_URI, type BackboneModel, type BackboneModelConstructor, type ContextMenuAction, type CreateNestedTemplatedElementTypeOptions, type CreateTemplatedElementTypeOptions, DOCUMENT_STRUCTURE_URI, type ElementModel, ElementType, ElementView, type LegacyWindow, type NamespacedRenderContext, type NestedTemplatedElementConfig, type PropsResolver, type RenderContext, type ReplacementSettings, STYLE_SCHEMA_URI, type TransformerOptions, UnknownStyleStateError, UnknownStyleTypeError, WIDGET_SCHEMA_URI, canBeNestedTemplated, createNestedTemplatedElementType, createNestedTemplatedElementView, createPropsResolver, createTemplatedElementView, createTransformer, createTransformersRegistry, endDragElementFromPanel, init, isAtomicWidget, registerElementType, registerModelExtensions, settingsTransformersRegistry, startDragElementFromPanel, styleTransformersRegistry, stylesInheritanceTransformersRegistry };
