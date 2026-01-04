export type TransformerRenderContext = Record< string, unknown >;

export type TransformerOptions< TContext extends TransformerRenderContext = TransformerRenderContext > = {
	key: string;
	signal?: AbortSignal;
	renderContext?: TContext;
};

export type UnbrandedTransformer< TValue > = ( value: TValue, options: TransformerOptions ) => unknown;

export type Transformer< TValue > = UnbrandedTransformer< TValue > & {
	__transformer: true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTransformer = Transformer< any >;

export type TransformersMap = Record< string, AnyTransformer >;
