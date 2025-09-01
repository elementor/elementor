export type UnbrandedTransformer< TValue > = (
	value: TValue,
	options: {
		key: string;
		signal?: AbortSignal;
	}
) => unknown;

export type Transformer< TValue > = UnbrandedTransformer< TValue > & {
	__transformer: true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTransformer = Transformer< any >;

export type TransformersMap = Record< string, AnyTransformer >;
