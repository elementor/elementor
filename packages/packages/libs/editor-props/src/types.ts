export type PropTypeKey = string;

export type DependencyOperator =
	| 'lt'
	| 'lte'
	| 'eq'
	| 'ne'
	| 'gte'
	| 'gt'
	| 'exists'
	| 'not_exist'
	| 'in'
	| 'nin'
	| 'contains'
	| 'ncontains';

export type DependencyTerm = {
	operator: DependencyOperator;
	path: string[];
	value: PropValue;
};

export type Dependency = {
	relation: 'or' | 'and';
	terms: ( DependencyTerm | Dependency )[];
};

type BasePropType< TValue > = {
	default?: TValue | null;
	settings: Record< string, unknown >;
	meta: Record< string, unknown >;
	dependencies?: Dependency;
};

export type PlainPropType = BasePropType< PlainPropValue > & {
	kind: 'plain';
	key: PropTypeKey;
};

export type BackgroundOverlayPropType = TransformablePropType & {
	$$type: 'background-image-overlay';
	value: TransformablePropType & {
		image: BackgroundOverlayImagePropType;
	};
};

export type BackgroundOverlayImagePropType = TransformablePropType & {
	$$type: 'image';
	value: {
		src: TransformablePropValue< 'dynamic', { name: string; settings?: Record< string, unknown > } >;
		size?: TransformablePropValue< 'size', string >;
	};
};

export type ArrayPropType = BasePropType< ArrayPropValue > & {
	kind: 'array';
	key: PropTypeKey;
	item_prop_type: PropType;
};

export type ObjectPropType = BasePropType< ObjectPropValue > & {
	kind: 'object';
	key: PropTypeKey;
	shape: Record< string, PropType >;
};

export type TransformablePropType = PlainPropType | ArrayPropType | ObjectPropType;

export type UnionPropType = BasePropType< PropValue > & {
	kind: 'union';
	prop_types: Record< string, TransformablePropType >;
};

export type PropType = TransformablePropType | UnionPropType;

export type PropsSchema = Record< string, PropType >;

type MaybeArray< T > = T | T[];

export type TransformablePropValue< Type extends string, Value = unknown > = {
	$$type: Type;
	value: Value;
	disabled?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTransformable = TransformablePropValue< string, any >;

export type ArrayPropValue = TransformablePropValue< string, PropValue[] >;

export type ObjectPropValue = TransformablePropValue< string, Record< string, PropValue > >;

export type PlainPropValue = MaybeArray< string | number | boolean | object | null | undefined >;

export type PropValue = PlainPropValue | TransformablePropValue< string >;

export type PropKey = string;

export type Props = Record< PropKey, PropValue >;
