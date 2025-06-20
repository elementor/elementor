import * as _elementor_editor_props from '@elementor/editor-props';
import { AnyTransformable, PropTypeKey, PropsSchema, Props } from '@elementor/editor-props';

declare function init(): void;

type UnbrandedTransformer<TValue> = (value: TValue, options: {
    key: string;
    signal?: AbortSignal;
}) => unknown;
type Transformer<TValue> = UnbrandedTransformer<TValue> & {
    __transformer: true;
};
type AnyTransformer = Transformer<any>;

declare const styleTransformersRegistry: {
    register(type: _elementor_editor_props.PropTypeKey, transformer: AnyTransformer): /*elided*/ any;
    registerFallback(transformer: AnyTransformer): /*elided*/ any;
    get(type: _elementor_editor_props.PropTypeKey): AnyTransformer | null;
    all(): {
        [x: string]: AnyTransformer;
    };
};

declare const settingsTransformersRegistry: {
    register(type: _elementor_editor_props.PropTypeKey, transformer: AnyTransformer): /*elided*/ any;
    registerFallback(transformer: AnyTransformer): /*elided*/ any;
    get(type: _elementor_editor_props.PropTypeKey): AnyTransformer | null;
    all(): {
        [x: string]: AnyTransformer;
    };
};

declare function createTransformer<TValue = never>(cb: TValue extends AnyTransformable ? 'Transformable values are invalid, use the actual value instead.' : UnbrandedTransformer<TValue>): Transformer<NoInfer<TValue>>;

type TransformersRegistry = ReturnType<typeof createTransformersRegistry>;
declare function createTransformersRegistry(): {
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
};
type ResolvedProps = Record<string, unknown>;
type PropsResolver = ReturnType<typeof createPropsResolver>;
declare function createPropsResolver({ transformers, schema: initialSchema, onPropResolve }: CreatePropResolverArgs): ({ props, schema, signal }: ResolveArgs) => Promise<ResolvedProps>;

export { type PropsResolver, createPropsResolver, createTransformer, createTransformersRegistry, init, settingsTransformersRegistry, styleTransformersRegistry };
