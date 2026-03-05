import type * as jsonschema from 'jsonschema';
import { type z, type ZodType } from '@elementor/schema';

type PropTypeKey = string;
type DependencyOperator =
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
type DependencyTerm = {
	operator: DependencyOperator;
	path: string[];
	nestedPath?: string[];
	value: PropValue;
	newValue?: TransformablePropValue$1<string>;
	effect?: 'disable' | 'hide';
};
type Dependency = {
	relation: 'or' | 'and';
	terms: (DependencyTerm | Dependency)[];
	newValue?: TransformablePropValue$1<string>;
};
type BasePropTypeMeta = {
	description?: string;
	[key: string]: unknown;
};
type BasePropType<TValue> = {
	default?: TValue | null;
	initial_value?: TValue | null;
	settings: Record<string, unknown>;
	meta: BasePropTypeMeta;
	dependencies?: Dependency;
};
type PlainPropType = BasePropType<PlainPropValue> & {
	kind: 'plain' | 'string' | 'number' | 'boolean';
	key: PropTypeKey;
};
type BackgroundOverlayPropType = TransformablePropType & {
	$$type: 'background-image-overlay';
	value: TransformablePropType & {
		image: BackgroundOverlayImagePropType;
	};
};
type BackgroundOverlayImagePropType = TransformablePropType & {
	$$type: 'image';
	value: {
		src: TransformablePropValue$1<
			'dynamic',
			{
				name: string;
				settings?: Record<string, unknown>;
			}
		>;
		size?: TransformablePropValue$1<'size', string>;
	};
};
type ArrayPropType = BasePropType<ArrayPropValue> & {
	kind: 'array';
	key: PropTypeKey;
	item_prop_type: PropType;
};
type ObjectPropType = BasePropType<ObjectPropValue> & {
	kind: 'object';
	key: PropTypeKey;
	shape: Record<string, PropType>;
};
type TransformablePropType = PlainPropType | ArrayPropType | ObjectPropType;
type UnionPropType = BasePropType<PropValue> & {
	kind: 'union';
	prop_types: Record<string, TransformablePropType>;
};
type PropType<T = object> = (TransformablePropType | UnionPropType) & T;
type PropsSchema = Record<
	string,
	PropType<{
		key?: string;
	}>
>;
type MaybeArray<T> = T | T[];
type TransformablePropValue$1<Type extends string, Value = unknown> = {
	$$type: Type;
	value: Value;
	disabled?: boolean;
};
type AnyTransformable = TransformablePropValue$1<string, any>;
type ArrayPropValue = TransformablePropValue$1<string, PropValue[]>;
type ObjectPropValue = TransformablePropValue$1<string, Record<string, PropValue>>;
type PlainPropValue = MaybeArray<string | number | boolean | object | null | undefined>;
type PropValue = PlainPropValue | TransformablePropValue$1<string>;
type PropKey = string;
type Props = Record<PropKey, PropValue>;

type JsonSchema7 = {
	type?: string | string[];
	properties?: Record<string, JsonSchema7>;
	items?: JsonSchema7;
	enum?: unknown[];
	anyOf?: JsonSchema7[];
	oneOf?: JsonSchema7[];
	allOf?: JsonSchema7[];
	required?: string[];
	description?: string;
	default?: unknown;
	if?: JsonSchema7;
	then?: JsonSchema7;
	else?: JsonSchema7;
	key?: string;
	[key: string]: unknown;
};

declare function jsonSchemaToPropType(schema: JsonSchema7, key?: string): PropType;

declare function propTypeToJsonSchema(propType: PropType): JsonSchema7;
declare function isPropKeyConfigurable(propKey: string): boolean;
declare function configurableKeys(schema: PropsSchema): string[];
declare function enrichWithIntention(jsonSchema: JsonSchema7, text?: string): JsonSchema7;
declare function removeIntention(jsonSchema: JsonSchema7): JsonSchema7;

type Updater<T> = (prev?: T) => T;
type CreateOptions = {
	base?: unknown;
	disabled?: boolean;
};
type PropTypeUtil<TKey extends string, TValue extends PropValue> = ReturnType<typeof createPropUtils<TKey, TValue>>;
/**
 * Usage example:
 *
 * ```ts
 * const elementsPropUtils = createPropUtils( 'elements', z.array( z.string() ) );
 *
 * elementsPropUtils.isValid( element.props?.children );
 * elementsPropUtils.create( [ 'a', 'b' ] );
 * elementsPropUtils.create( ( prev = [] ) => [ ...prev, 'c' ], { base: element.props?.children } );
 * elementsPropUtils.create( ( prev = [] ) => [ ...prev, 'c' ], { disabled: true } );
 * elementsPropUtils.extract( element.props?.children );
 *
 * ```
 * @param key
 */
declare function getPropSchemaFromCache(key: string): PropTypeUtil<string, PropValue> | undefined;
declare function createPropUtils<TKey extends string, TValue extends PropValue>(
	key: TKey,
	valueSchema: ZodType<TValue>
): {
	extract: (prop: unknown) => TValue | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<TKey, TValue>;
	create: {
		(value: TValue): TransformablePropValue$1<TKey, TValue>;
		(value: TValue, createOptions?: CreateOptions): TransformablePropValue$1<TKey, TValue>;
		(value: Updater<TValue>, createOptions: CreateOptions): TransformablePropValue$1<TKey, TValue>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<TKey>;
			value: z.ZodType<TValue, z.ZodTypeDef, TValue>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		z.objectUtil.addQuestionMarks<
			z.baseObjectOutputType<{
				$$type: z.ZodLiteral<TKey>;
				value: z.ZodType<TValue, z.ZodTypeDef, TValue>;
				disabled: z.ZodOptional<z.ZodBoolean>;
			}>,
			any
		> extends infer T
			? { [k in keyof T]: T[k] }
			: never,
		z.baseObjectInputType<{
			$$type: z.ZodLiteral<TKey>;
			value: z.ZodType<TValue, z.ZodTypeDef, TValue>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		}> extends infer T_1
			? { [k_1 in keyof T_1]: T_1[k_1] }
			: never
	>;
	key: TKey;
};
declare function createArrayPropUtils<TKey extends string, TValue extends PropValue>(
	key: TKey,
	valueSchema: ZodType<TValue>,
	overrideKey?: string
): {
	extract: (prop: unknown) => TValue[] | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<string, TValue[]>;
	create: {
		(value: TValue[]): TransformablePropValue$1<string, TValue[]>;
		(value: TValue[], createOptions?: CreateOptions): TransformablePropValue$1<string, TValue[]>;
		(value: Updater<TValue[]>, createOptions: CreateOptions): TransformablePropValue$1<string, TValue[]>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<string>;
			value: z.ZodType<TValue[], z.ZodTypeDef, TValue[]>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: string;
			value: TValue[];
			disabled?: boolean | undefined;
		},
		{
			$$type: string;
			value: TValue[];
			disabled?: boolean | undefined;
		}
	>;
	key: string;
};

declare const boxShadowPropTypeUtil: {
	extract: (prop: unknown) =>
		| {
				$$type: 'shadow';
				value: {
					position?: any;
					hOffset?: any;
					vOffset?: any;
					blur?: any;
					spread?: any;
					color?: any;
				};
				disabled?: boolean | undefined;
		  }[]
		| null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'box-shadow',
		{
			$$type: 'shadow';
			value: {
				position?: any;
				hOffset?: any;
				vOffset?: any;
				blur?: any;
				spread?: any;
				color?: any;
			};
			disabled?: boolean | undefined;
		}[]
	>;
	create: {
		(
			value: {
				$$type: 'shadow';
				value: {
					position?: any;
					hOffset?: any;
					vOffset?: any;
					blur?: any;
					spread?: any;
					color?: any;
				};
				disabled?: boolean | undefined;
			}[]
		): TransformablePropValue$1<
			'box-shadow',
			{
				$$type: 'shadow';
				value: {
					position?: any;
					hOffset?: any;
					vOffset?: any;
					blur?: any;
					spread?: any;
					color?: any;
				};
				disabled?: boolean | undefined;
			}[]
		>;
		(
			value: {
				$$type: 'shadow';
				value: {
					position?: any;
					hOffset?: any;
					vOffset?: any;
					blur?: any;
					spread?: any;
					color?: any;
				};
				disabled?: boolean | undefined;
			}[],
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'box-shadow',
			{
				$$type: 'shadow';
				value: {
					position?: any;
					hOffset?: any;
					vOffset?: any;
					blur?: any;
					spread?: any;
					color?: any;
				};
				disabled?: boolean | undefined;
			}[]
		>;
		(
			value: (
				prev?:
					| {
							$$type: 'shadow';
							value: {
								position?: any;
								hOffset?: any;
								vOffset?: any;
								blur?: any;
								spread?: any;
								color?: any;
							};
							disabled?: boolean | undefined;
					  }[]
					| undefined
			) => {
				$$type: 'shadow';
				value: {
					position?: any;
					hOffset?: any;
					vOffset?: any;
					blur?: any;
					spread?: any;
					color?: any;
				};
				disabled?: boolean | undefined;
			}[],
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'box-shadow',
			{
				$$type: 'shadow';
				value: {
					position?: any;
					hOffset?: any;
					vOffset?: any;
					blur?: any;
					spread?: any;
					color?: any;
				};
				disabled?: boolean | undefined;
			}[]
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'box-shadow'>;
			value: z.ZodType<
				{
					$$type: 'shadow';
					value: {
						position?: any;
						hOffset?: any;
						vOffset?: any;
						blur?: any;
						spread?: any;
						color?: any;
					};
					disabled?: boolean | undefined;
				}[],
				z.ZodTypeDef,
				{
					$$type: 'shadow';
					value: {
						position?: any;
						hOffset?: any;
						vOffset?: any;
						blur?: any;
						spread?: any;
						color?: any;
					};
					disabled?: boolean | undefined;
				}[]
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'box-shadow';
			value: {
				$$type: 'shadow';
				value: {
					position?: any;
					hOffset?: any;
					vOffset?: any;
					blur?: any;
					spread?: any;
					color?: any;
				};
				disabled?: boolean | undefined;
			}[];
			disabled?: boolean | undefined;
		},
		{
			$$type: 'box-shadow';
			value: {
				$$type: 'shadow';
				value: {
					position?: any;
					hOffset?: any;
					vOffset?: any;
					blur?: any;
					spread?: any;
					color?: any;
				};
				disabled?: boolean | undefined;
			}[];
			disabled?: boolean | undefined;
		}
	>;
	key: 'box-shadow';
};
type BoxShadowPropValue = z.infer<typeof boxShadowPropTypeUtil.schema>;

declare const borderRadiusPropTypeUtil: {
	extract: (prop: unknown) => {
		'start-start'?: any;
		'start-end'?: any;
		'end-start'?: any;
		'end-end'?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'border-radius',
		{
			'start-start'?: any;
			'start-end'?: any;
			'end-start'?: any;
			'end-end'?: any;
		}
	>;
	create: {
		(value: {
			'start-start'?: any;
			'start-end'?: any;
			'end-start'?: any;
			'end-end'?: any;
		}): TransformablePropValue$1<
			'border-radius',
			{
				'start-start'?: any;
				'start-end'?: any;
				'end-start'?: any;
				'end-end'?: any;
			}
		>;
		(
			value: {
				'start-start'?: any;
				'start-end'?: any;
				'end-start'?: any;
				'end-end'?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'border-radius',
			{
				'start-start'?: any;
				'start-end'?: any;
				'end-start'?: any;
				'end-end'?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							'start-start'?: any;
							'start-end'?: any;
							'end-start'?: any;
							'end-end'?: any;
					  }
					| undefined
			) => {
				'start-start'?: any;
				'start-end'?: any;
				'end-start'?: any;
				'end-end'?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'border-radius',
			{
				'start-start'?: any;
				'start-end'?: any;
				'end-start'?: any;
				'end-end'?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'border-radius'>;
			value: z.ZodType<
				{
					'start-start'?: any;
					'start-end'?: any;
					'end-start'?: any;
					'end-end'?: any;
				},
				z.ZodTypeDef,
				{
					'start-start'?: any;
					'start-end'?: any;
					'end-start'?: any;
					'end-end'?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'border-radius';
			value: {
				'start-start'?: any;
				'start-end'?: any;
				'end-start'?: any;
				'end-end'?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'border-radius';
			value: {
				'start-start'?: any;
				'start-end'?: any;
				'end-start'?: any;
				'end-end'?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'border-radius';
};
type BorderRadiusPropValue = z.infer<typeof borderRadiusPropTypeUtil.schema>;

declare const borderWidthPropTypeUtil: {
	extract: (prop: unknown) => {
		'block-start'?: any;
		'block-end'?: any;
		'inline-start'?: any;
		'inline-end'?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'border-width',
		{
			'block-start'?: any;
			'block-end'?: any;
			'inline-start'?: any;
			'inline-end'?: any;
		}
	>;
	create: {
		(value: {
			'block-start'?: any;
			'block-end'?: any;
			'inline-start'?: any;
			'inline-end'?: any;
		}): TransformablePropValue$1<
			'border-width',
			{
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			}
		>;
		(
			value: {
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'border-width',
			{
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							'block-start'?: any;
							'block-end'?: any;
							'inline-start'?: any;
							'inline-end'?: any;
					  }
					| undefined
			) => {
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'border-width',
			{
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'border-width'>;
			value: z.ZodType<
				{
					'block-start'?: any;
					'block-end'?: any;
					'inline-start'?: any;
					'inline-end'?: any;
				},
				z.ZodTypeDef,
				{
					'block-start'?: any;
					'block-end'?: any;
					'inline-start'?: any;
					'inline-end'?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'border-width';
			value: {
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'border-width';
			value: {
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'border-width';
};
type BorderWidthPropValue = z.infer<typeof borderWidthPropTypeUtil.schema>;

declare const CLASSES_PROP_KEY = 'classes';
declare const classesPropTypeUtil: {
	extract: (prop: unknown) => string[] | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'classes', string[]>;
	create: {
		(value: string[]): TransformablePropValue$1<'classes', string[]>;
		(value: string[], createOptions?: CreateOptions): TransformablePropValue$1<'classes', string[]>;
		(
			value: (prev?: string[] | undefined) => string[],
			createOptions: CreateOptions
		): TransformablePropValue$1<'classes', string[]>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'classes'>;
			value: z.ZodType<string[], z.ZodTypeDef, string[]>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'classes';
			value: string[];
			disabled?: boolean | undefined;
		},
		{
			$$type: 'classes';
			value: string[];
			disabled?: boolean | undefined;
		}
	>;
	key: 'classes';
};
type ClassesPropValue = z.infer<typeof classesPropTypeUtil.schema>;

declare const colorPropTypeUtil: {
	extract: (prop: unknown) => string | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'color', string>;
	create: {
		(value: string): TransformablePropValue$1<'color', string>;
		(value: string, createOptions?: CreateOptions): TransformablePropValue$1<'color', string>;
		(
			value: (prev?: string | undefined) => string,
			createOptions: CreateOptions
		): TransformablePropValue$1<'color', string>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'color'>;
			value: z.ZodType<string, z.ZodTypeDef, string>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'color';
			value: string;
			disabled?: boolean | undefined;
		},
		{
			$$type: 'color';
			value: string;
			disabled?: boolean | undefined;
		}
	>;
	key: 'color';
};
type ColorPropValue = z.infer<typeof colorPropTypeUtil.schema>;

declare const flexPropTypeUtil: {
	extract: (prop: unknown) => {
		flexGrow?: any;
		flexShrink?: any;
		flexBasis?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'flex',
		{
			flexGrow?: any;
			flexShrink?: any;
			flexBasis?: any;
		}
	>;
	create: {
		(value: { flexGrow?: any; flexShrink?: any; flexBasis?: any }): TransformablePropValue$1<
			'flex',
			{
				flexGrow?: any;
				flexShrink?: any;
				flexBasis?: any;
			}
		>;
		(
			value: {
				flexGrow?: any;
				flexShrink?: any;
				flexBasis?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'flex',
			{
				flexGrow?: any;
				flexShrink?: any;
				flexBasis?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							flexGrow?: any;
							flexShrink?: any;
							flexBasis?: any;
					  }
					| undefined
			) => {
				flexGrow?: any;
				flexShrink?: any;
				flexBasis?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'flex',
			{
				flexGrow?: any;
				flexShrink?: any;
				flexBasis?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'flex'>;
			value: z.ZodType<
				{
					flexGrow?: any;
					flexShrink?: any;
					flexBasis?: any;
				},
				z.ZodTypeDef,
				{
					flexGrow?: any;
					flexShrink?: any;
					flexBasis?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'flex';
			value: {
				flexGrow?: any;
				flexShrink?: any;
				flexBasis?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'flex';
			value: {
				flexGrow?: any;
				flexShrink?: any;
				flexBasis?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'flex';
};
type FlexPropValue = z.infer<typeof flexPropTypeUtil.schema>;

declare const imagePropTypeUtil: {
	extract: (prop: unknown) => {
		size?: any;
		src?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'image',
		{
			size?: any;
			src?: any;
		}
	>;
	create: {
		(value: { size?: any; src?: any }): TransformablePropValue$1<
			'image',
			{
				size?: any;
				src?: any;
			}
		>;
		(
			value: {
				size?: any;
				src?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'image',
			{
				size?: any;
				src?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							size?: any;
							src?: any;
					  }
					| undefined
			) => {
				size?: any;
				src?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'image',
			{
				size?: any;
				src?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'image'>;
			value: z.ZodType<
				{
					size?: any;
					src?: any;
				},
				z.ZodTypeDef,
				{
					size?: any;
					src?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'image';
			value: {
				size?: any;
				src?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'image';
			value: {
				size?: any;
				src?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'image';
};
type ImagePropValue = z.infer<typeof imagePropTypeUtil.schema>;

declare const imageAttachmentIdPropType: {
	extract: (prop: unknown) => number | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'image-attachment-id', number>;
	create: {
		(value: number): TransformablePropValue$1<'image-attachment-id', number>;
		(value: number, createOptions?: CreateOptions): TransformablePropValue$1<'image-attachment-id', number>;
		(
			value: (prev?: number | undefined) => number,
			createOptions: CreateOptions
		): TransformablePropValue$1<'image-attachment-id', number>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'image-attachment-id'>;
			value: z.ZodType<number, z.ZodTypeDef, number>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'image-attachment-id';
			value: number;
			disabled?: boolean | undefined;
		},
		{
			$$type: 'image-attachment-id';
			value: number;
			disabled?: boolean | undefined;
		}
	>;
	key: 'image-attachment-id';
};
type ImageAttachmentIdPropValue = z.infer<typeof imageAttachmentIdPropType.schema>;

declare const imageSrcPropTypeUtil: {
	extract: (prop: unknown) =>
		| {
				url: null;
				id?: any;
		  }
		| {
				id: null;
				url?: any;
		  }
		| null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'image-src',
		| {
				url: null;
				id?: any;
		  }
		| {
				id: null;
				url?: any;
		  }
	>;
	create: {
		(
			value:
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  }
		): TransformablePropValue$1<
			'image-src',
			| {
					url: null;
					id?: any;
			  }
			| {
					id: null;
					url?: any;
			  }
		>;
		(
			value:
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  },
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'image-src',
			| {
					url: null;
					id?: any;
			  }
			| {
					id: null;
					url?: any;
			  }
		>;
		(
			value: (
				prev?:
					| {
							url: null;
							id?: any;
					  }
					| {
							id: null;
							url?: any;
					  }
					| undefined
			) =>
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  },
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'image-src',
			| {
					url: null;
					id?: any;
			  }
			| {
					id: null;
					url?: any;
			  }
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'image-src'>;
			value: z.ZodType<
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  },
				z.ZodTypeDef,
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  }
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'image-src';
			value:
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  };
			disabled?: boolean | undefined;
		},
		{
			$$type: 'image-src';
			value:
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  };
			disabled?: boolean | undefined;
		}
	>;
	key: 'image-src';
};
type ImageSrcPropValue = z.infer<typeof imageSrcPropTypeUtil.schema>;

declare const videoAttachmentIdPropType: {
	extract: (prop: unknown) => number | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'video-attachment-id', number>;
	create: {
		(value: number): TransformablePropValue$1<'video-attachment-id', number>;
		(value: number, createOptions?: CreateOptions): TransformablePropValue$1<'video-attachment-id', number>;
		(
			value: (prev?: number | undefined) => number,
			createOptions: CreateOptions
		): TransformablePropValue$1<'video-attachment-id', number>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'video-attachment-id'>;
			value: z.ZodType<number, z.ZodTypeDef, number>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'video-attachment-id';
			value: number;
			disabled?: boolean | undefined;
		},
		{
			$$type: 'video-attachment-id';
			value: number;
			disabled?: boolean | undefined;
		}
	>;
	key: 'video-attachment-id';
};
type VideoAttachmentIdPropValue = z.infer<typeof videoAttachmentIdPropType.schema>;

declare const videoSrcPropTypeUtil: {
	extract: (prop: unknown) =>
		| {
				url: null;
				id?: any;
		  }
		| {
				id: null;
				url?: any;
		  }
		| null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'video-src',
		| {
				url: null;
				id?: any;
		  }
		| {
				id: null;
				url?: any;
		  }
	>;
	create: {
		(
			value:
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  }
		): TransformablePropValue$1<
			'video-src',
			| {
					url: null;
					id?: any;
			  }
			| {
					id: null;
					url?: any;
			  }
		>;
		(
			value:
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  },
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'video-src',
			| {
					url: null;
					id?: any;
			  }
			| {
					id: null;
					url?: any;
			  }
		>;
		(
			value: (
				prev?:
					| {
							url: null;
							id?: any;
					  }
					| {
							id: null;
							url?: any;
					  }
					| undefined
			) =>
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  },
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'video-src',
			| {
					url: null;
					id?: any;
			  }
			| {
					id: null;
					url?: any;
			  }
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'video-src'>;
			value: z.ZodType<
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  },
				z.ZodTypeDef,
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  }
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'video-src';
			value:
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  };
			disabled?: boolean | undefined;
		},
		{
			$$type: 'video-src';
			value:
				| {
						url: null;
						id?: any;
				  }
				| {
						id: null;
						url?: any;
				  };
			disabled?: boolean | undefined;
		}
	>;
	key: 'video-src';
};
type VideoSrcPropValue = z.infer<typeof videoSrcPropTypeUtil.schema>;

declare const dimensionsPropTypeUtil: {
	extract: (prop: unknown) => {
		'block-start'?: any;
		'block-end'?: any;
		'inline-start'?: any;
		'inline-end'?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'dimensions',
		{
			'block-start'?: any;
			'block-end'?: any;
			'inline-start'?: any;
			'inline-end'?: any;
		}
	>;
	create: {
		(value: {
			'block-start'?: any;
			'block-end'?: any;
			'inline-start'?: any;
			'inline-end'?: any;
		}): TransformablePropValue$1<
			'dimensions',
			{
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			}
		>;
		(
			value: {
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'dimensions',
			{
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							'block-start'?: any;
							'block-end'?: any;
							'inline-start'?: any;
							'inline-end'?: any;
					  }
					| undefined
			) => {
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'dimensions',
			{
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'dimensions'>;
			value: z.ZodType<
				{
					'block-start'?: any;
					'block-end'?: any;
					'inline-start'?: any;
					'inline-end'?: any;
				},
				z.ZodTypeDef,
				{
					'block-start'?: any;
					'block-end'?: any;
					'inline-start'?: any;
					'inline-end'?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'dimensions';
			value: {
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'dimensions';
			value: {
				'block-start'?: any;
				'block-end'?: any;
				'inline-start'?: any;
				'inline-end'?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'dimensions';
};
type DimensionsPropValue = z.infer<typeof dimensionsPropTypeUtil.schema>;

declare const numberPropTypeUtil: {
	extract: (prop: unknown) => number | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'number', number | null>;
	create: {
		(value: number | null): TransformablePropValue$1<'number', number | null>;
		(value: number | null, createOptions?: CreateOptions): TransformablePropValue$1<'number', number | null>;
		(
			value: (prev?: number | null | undefined) => number | null,
			createOptions: CreateOptions
		): TransformablePropValue$1<'number', number | null>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'number'>;
			value: z.ZodType<number | null, z.ZodTypeDef, number | null>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'number';
			value: number | null;
			disabled?: boolean | undefined;
		},
		{
			$$type: 'number';
			value: number | null;
			disabled?: boolean | undefined;
		}
	>;
	key: 'number';
};
type NumberPropValue = z.infer<typeof numberPropTypeUtil.schema>;

declare const shadowPropTypeUtil: {
	extract: (prop: unknown) => {
		position?: any;
		hOffset?: any;
		vOffset?: any;
		blur?: any;
		spread?: any;
		color?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'shadow',
		{
			position?: any;
			hOffset?: any;
			vOffset?: any;
			blur?: any;
			spread?: any;
			color?: any;
		}
	>;
	create: {
		(value: {
			position?: any;
			hOffset?: any;
			vOffset?: any;
			blur?: any;
			spread?: any;
			color?: any;
		}): TransformablePropValue$1<
			'shadow',
			{
				position?: any;
				hOffset?: any;
				vOffset?: any;
				blur?: any;
				spread?: any;
				color?: any;
			}
		>;
		(
			value: {
				position?: any;
				hOffset?: any;
				vOffset?: any;
				blur?: any;
				spread?: any;
				color?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'shadow',
			{
				position?: any;
				hOffset?: any;
				vOffset?: any;
				blur?: any;
				spread?: any;
				color?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							position?: any;
							hOffset?: any;
							vOffset?: any;
							blur?: any;
							spread?: any;
							color?: any;
					  }
					| undefined
			) => {
				position?: any;
				hOffset?: any;
				vOffset?: any;
				blur?: any;
				spread?: any;
				color?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'shadow',
			{
				position?: any;
				hOffset?: any;
				vOffset?: any;
				blur?: any;
				spread?: any;
				color?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'shadow'>;
			value: z.ZodType<
				{
					position?: any;
					hOffset?: any;
					vOffset?: any;
					blur?: any;
					spread?: any;
					color?: any;
				},
				z.ZodTypeDef,
				{
					position?: any;
					hOffset?: any;
					vOffset?: any;
					blur?: any;
					spread?: any;
					color?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'shadow';
			value: {
				position?: any;
				hOffset?: any;
				vOffset?: any;
				blur?: any;
				spread?: any;
				color?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'shadow';
			value: {
				position?: any;
				hOffset?: any;
				vOffset?: any;
				blur?: any;
				spread?: any;
				color?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'shadow';
};
type ShadowPropValue = z.infer<typeof shadowPropTypeUtil.schema>;

declare const sizePropTypeUtil: {
	extract: (prop: unknown) =>
		| {
				size: number;
				unit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'ch';
		  }
		| {
				size: number;
				unit: 'deg' | 'rad' | 'grad' | 'turn';
		  }
		| {
				size: number;
				unit: 's' | 'ms';
		  }
		| {
				size: '';
				unit: 'auto';
		  }
		| {
				size: string;
				unit: 'custom';
		  }
		| null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'size',
		| {
				size: number;
				unit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'ch';
		  }
		| {
				size: number;
				unit: 'deg' | 'rad' | 'grad' | 'turn';
		  }
		| {
				size: number;
				unit: 's' | 'ms';
		  }
		| {
				size: '';
				unit: 'auto';
		  }
		| {
				size: string;
				unit: 'custom';
		  }
	>;
	create: {
		(
			value:
				| {
						size: number;
						unit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'ch';
				  }
				| {
						size: number;
						unit: 'deg' | 'rad' | 'grad' | 'turn';
				  }
				| {
						size: number;
						unit: 's' | 'ms';
				  }
				| {
						size: '';
						unit: 'auto';
				  }
				| {
						size: string;
						unit: 'custom';
				  }
		): TransformablePropValue$1<
			'size',
			| {
					size: number;
					unit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'ch';
			  }
			| {
					size: number;
					unit: 'deg' | 'rad' | 'grad' | 'turn';
			  }
			| {
					size: number;
					unit: 's' | 'ms';
			  }
			| {
					size: '';
					unit: 'auto';
			  }
			| {
					size: string;
					unit: 'custom';
			  }
		>;
		(
			value:
				| {
						size: number;
						unit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'ch';
				  }
				| {
						size: number;
						unit: 'deg' | 'rad' | 'grad' | 'turn';
				  }
				| {
						size: number;
						unit: 's' | 'ms';
				  }
				| {
						size: '';
						unit: 'auto';
				  }
				| {
						size: string;
						unit: 'custom';
				  },
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'size',
			| {
					size: number;
					unit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'ch';
			  }
			| {
					size: number;
					unit: 'deg' | 'rad' | 'grad' | 'turn';
			  }
			| {
					size: number;
					unit: 's' | 'ms';
			  }
			| {
					size: '';
					unit: 'auto';
			  }
			| {
					size: string;
					unit: 'custom';
			  }
		>;
		(
			value: (
				prev?:
					| {
							size: number;
							unit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'ch';
					  }
					| {
							size: number;
							unit: 'deg' | 'rad' | 'grad' | 'turn';
					  }
					| {
							size: number;
							unit: 's' | 'ms';
					  }
					| {
							size: '';
							unit: 'auto';
					  }
					| {
							size: string;
							unit: 'custom';
					  }
					| undefined
			) =>
				| {
						size: number;
						unit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'ch';
				  }
				| {
						size: number;
						unit: 'deg' | 'rad' | 'grad' | 'turn';
				  }
				| {
						size: number;
						unit: 's' | 'ms';
				  }
				| {
						size: '';
						unit: 'auto';
				  }
				| {
						size: string;
						unit: 'custom';
				  },
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'size',
			| {
					size: number;
					unit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'ch';
			  }
			| {
					size: number;
					unit: 'deg' | 'rad' | 'grad' | 'turn';
			  }
			| {
					size: number;
					unit: 's' | 'ms';
			  }
			| {
					size: '';
					unit: 'auto';
			  }
			| {
					size: string;
					unit: 'custom';
			  }
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'size'>;
			value: z.ZodType<
				| {
						size: number;
						unit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'ch';
				  }
				| {
						size: number;
						unit: 'deg' | 'rad' | 'grad' | 'turn';
				  }
				| {
						size: number;
						unit: 's' | 'ms';
				  }
				| {
						size: '';
						unit: 'auto';
				  }
				| {
						size: string;
						unit: 'custom';
				  },
				z.ZodTypeDef,
				| {
						size: number;
						unit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'ch';
				  }
				| {
						size: number;
						unit: 'deg' | 'rad' | 'grad' | 'turn';
				  }
				| {
						size: number;
						unit: 's' | 'ms';
				  }
				| {
						size: '';
						unit: 'auto';
				  }
				| {
						size: string;
						unit: 'custom';
				  }
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'size';
			value:
				| {
						size: number;
						unit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'ch';
				  }
				| {
						size: number;
						unit: 'deg' | 'rad' | 'grad' | 'turn';
				  }
				| {
						size: number;
						unit: 's' | 'ms';
				  }
				| {
						size: '';
						unit: 'auto';
				  }
				| {
						size: string;
						unit: 'custom';
				  };
			disabled?: boolean | undefined;
		},
		{
			$$type: 'size';
			value:
				| {
						size: number;
						unit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'ch';
				  }
				| {
						size: number;
						unit: 'deg' | 'rad' | 'grad' | 'turn';
				  }
				| {
						size: number;
						unit: 's' | 'ms';
				  }
				| {
						size: '';
						unit: 'auto';
				  }
				| {
						size: string;
						unit: 'custom';
				  };
			disabled?: boolean | undefined;
		}
	>;
	key: 'size';
};
type SizePropValue = z.infer<typeof sizePropTypeUtil.schema>;

declare const stringPropTypeUtil: {
	extract: (prop: unknown) => string | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'string', string | null>;
	create: {
		(value: string | null): TransformablePropValue$1<'string', string | null>;
		(value: string | null, createOptions?: CreateOptions): TransformablePropValue$1<'string', string | null>;
		(
			value: (prev?: string | null | undefined) => string | null,
			createOptions: CreateOptions
		): TransformablePropValue$1<'string', string | null>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'string'>;
			value: z.ZodType<string | null, z.ZodTypeDef, string | null>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'string';
			value: string | null;
			disabled?: boolean | undefined;
		},
		{
			$$type: 'string';
			value: string | null;
			disabled?: boolean | undefined;
		}
	>;
	key: 'string';
};
type StringPropValue = z.infer<typeof stringPropTypeUtil.schema>;

declare const stringArrayPropTypeUtil: {
	extract: (prop: unknown) =>
		| {
				$$type: 'string';
				value: string | null;
				disabled?: boolean | undefined;
		  }[]
		| null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		string,
		{
			$$type: 'string';
			value: string | null;
			disabled?: boolean | undefined;
		}[]
	>;
	create: {
		(
			value: {
				$$type: 'string';
				value: string | null;
				disabled?: boolean | undefined;
			}[]
		): TransformablePropValue$1<
			string,
			{
				$$type: 'string';
				value: string | null;
				disabled?: boolean | undefined;
			}[]
		>;
		(
			value: {
				$$type: 'string';
				value: string | null;
				disabled?: boolean | undefined;
			}[],
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			string,
			{
				$$type: 'string';
				value: string | null;
				disabled?: boolean | undefined;
			}[]
		>;
		(
			value: (
				prev?:
					| {
							$$type: 'string';
							value: string | null;
							disabled?: boolean | undefined;
					  }[]
					| undefined
			) => {
				$$type: 'string';
				value: string | null;
				disabled?: boolean | undefined;
			}[],
			createOptions: CreateOptions
		): TransformablePropValue$1<
			string,
			{
				$$type: 'string';
				value: string | null;
				disabled?: boolean | undefined;
			}[]
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<string>;
			value: z.ZodType<
				{
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				}[],
				z.ZodTypeDef,
				{
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				}[]
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: string;
			value: {
				$$type: 'string';
				value: string | null;
				disabled?: boolean | undefined;
			}[];
			disabled?: boolean | undefined;
		},
		{
			$$type: string;
			value: {
				$$type: 'string';
				value: string | null;
				disabled?: boolean | undefined;
			}[];
			disabled?: boolean | undefined;
		}
	>;
	key: string;
};
type StringArrayPropValue = z.infer<typeof stringArrayPropTypeUtil.schema>;

declare const strokePropTypeUtil: {
	extract: (prop: unknown) => {
		color?: any;
		width?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'stroke',
		{
			color?: any;
			width?: any;
		}
	>;
	create: {
		(value: { color?: any; width?: any }): TransformablePropValue$1<
			'stroke',
			{
				color?: any;
				width?: any;
			}
		>;
		(
			value: {
				color?: any;
				width?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'stroke',
			{
				color?: any;
				width?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							color?: any;
							width?: any;
					  }
					| undefined
			) => {
				color?: any;
				width?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'stroke',
			{
				color?: any;
				width?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'stroke'>;
			value: z.ZodType<
				{
					color?: any;
					width?: any;
				},
				z.ZodTypeDef,
				{
					color?: any;
					width?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'stroke';
			value: {
				color?: any;
				width?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'stroke';
			value: {
				color?: any;
				width?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'stroke';
};
type StrokePropValue = z.infer<typeof strokePropTypeUtil.schema>;

declare const urlPropTypeUtil: {
	extract: (prop: unknown) => string | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'url', string | null>;
	create: {
		(value: string | null): TransformablePropValue$1<'url', string | null>;
		(value: string | null, createOptions?: CreateOptions): TransformablePropValue$1<'url', string | null>;
		(
			value: (prev?: string | null | undefined) => string | null,
			createOptions: CreateOptions
		): TransformablePropValue$1<'url', string | null>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'url'>;
			value: z.ZodType<string | null, z.ZodTypeDef, string | null>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'url';
			value: string | null;
			disabled?: boolean | undefined;
		},
		{
			$$type: 'url';
			value: string | null;
			disabled?: boolean | undefined;
		}
	>;
	key: 'url';
};
type UrlPropValue = z.infer<typeof urlPropTypeUtil.schema>;

declare const layoutDirectionPropTypeUtil: {
	extract: (prop: unknown) => {
		row?: any;
		column?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'layout-direction',
		{
			row?: any;
			column?: any;
		}
	>;
	create: {
		(value: { row?: any; column?: any }): TransformablePropValue$1<
			'layout-direction',
			{
				row?: any;
				column?: any;
			}
		>;
		(
			value: {
				row?: any;
				column?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'layout-direction',
			{
				row?: any;
				column?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							row?: any;
							column?: any;
					  }
					| undefined
			) => {
				row?: any;
				column?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'layout-direction',
			{
				row?: any;
				column?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'layout-direction'>;
			value: z.ZodType<
				{
					row?: any;
					column?: any;
				},
				z.ZodTypeDef,
				{
					row?: any;
					column?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'layout-direction';
			value: {
				row?: any;
				column?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'layout-direction';
			value: {
				row?: any;
				column?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'layout-direction';
};
type LayoutDirectionPropValue = z.infer<typeof layoutDirectionPropTypeUtil.schema>;

declare const linkPropTypeUtil: {
	extract: (prop: unknown) => {
		destination?: any;
		isTargetBlank?: any;
		tag?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'link',
		{
			destination?: any;
			isTargetBlank?: any;
			tag?: any;
		}
	>;
	create: {
		(value: { destination?: any; isTargetBlank?: any; tag?: any }): TransformablePropValue$1<
			'link',
			{
				destination?: any;
				isTargetBlank?: any;
				tag?: any;
			}
		>;
		(
			value: {
				destination?: any;
				isTargetBlank?: any;
				tag?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'link',
			{
				destination?: any;
				isTargetBlank?: any;
				tag?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							destination?: any;
							isTargetBlank?: any;
							tag?: any;
					  }
					| undefined
			) => {
				destination?: any;
				isTargetBlank?: any;
				tag?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'link',
			{
				destination?: any;
				isTargetBlank?: any;
				tag?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'link'>;
			value: z.ZodType<
				{
					destination?: any;
					isTargetBlank?: any;
					tag?: any;
				},
				z.ZodTypeDef,
				{
					destination?: any;
					isTargetBlank?: any;
					tag?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'link';
			value: {
				destination?: any;
				isTargetBlank?: any;
				tag?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'link';
			value: {
				destination?: any;
				isTargetBlank?: any;
				tag?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'link';
};
type LinkPropValue = z.infer<typeof linkPropTypeUtil.schema>;

declare const emailPropTypeUtil: {
	extract: (prop: unknown) => {
		message?: any;
		to?: any;
		subject?: any;
		from?: any;
		'meta-data'?: any;
		'send-as'?: any;
		'from-name'?: any;
		'reply-to'?: any;
		cc?: any;
		bcc?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'email',
		{
			message?: any;
			to?: any;
			subject?: any;
			from?: any;
			'meta-data'?: any;
			'send-as'?: any;
			'from-name'?: any;
			'reply-to'?: any;
			cc?: any;
			bcc?: any;
		}
	>;
	create: {
		(value: {
			message?: any;
			to?: any;
			subject?: any;
			from?: any;
			'meta-data'?: any;
			'send-as'?: any;
			'from-name'?: any;
			'reply-to'?: any;
			cc?: any;
			bcc?: any;
		}): TransformablePropValue$1<
			'email',
			{
				message?: any;
				to?: any;
				subject?: any;
				from?: any;
				'meta-data'?: any;
				'send-as'?: any;
				'from-name'?: any;
				'reply-to'?: any;
				cc?: any;
				bcc?: any;
			}
		>;
		(
			value: {
				message?: any;
				to?: any;
				subject?: any;
				from?: any;
				'meta-data'?: any;
				'send-as'?: any;
				'from-name'?: any;
				'reply-to'?: any;
				cc?: any;
				bcc?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'email',
			{
				message?: any;
				to?: any;
				subject?: any;
				from?: any;
				'meta-data'?: any;
				'send-as'?: any;
				'from-name'?: any;
				'reply-to'?: any;
				cc?: any;
				bcc?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							message?: any;
							to?: any;
							subject?: any;
							from?: any;
							'meta-data'?: any;
							'send-as'?: any;
							'from-name'?: any;
							'reply-to'?: any;
							cc?: any;
							bcc?: any;
					  }
					| undefined
			) => {
				message?: any;
				to?: any;
				subject?: any;
				from?: any;
				'meta-data'?: any;
				'send-as'?: any;
				'from-name'?: any;
				'reply-to'?: any;
				cc?: any;
				bcc?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'email',
			{
				message?: any;
				to?: any;
				subject?: any;
				from?: any;
				'meta-data'?: any;
				'send-as'?: any;
				'from-name'?: any;
				'reply-to'?: any;
				cc?: any;
				bcc?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'email'>;
			value: z.ZodType<
				{
					message?: any;
					to?: any;
					subject?: any;
					from?: any;
					'meta-data'?: any;
					'send-as'?: any;
					'from-name'?: any;
					'reply-to'?: any;
					cc?: any;
					bcc?: any;
				},
				z.ZodTypeDef,
				{
					message?: any;
					to?: any;
					subject?: any;
					from?: any;
					'meta-data'?: any;
					'send-as'?: any;
					'from-name'?: any;
					'reply-to'?: any;
					cc?: any;
					bcc?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'email';
			value: {
				message?: any;
				to?: any;
				subject?: any;
				from?: any;
				'meta-data'?: any;
				'send-as'?: any;
				'from-name'?: any;
				'reply-to'?: any;
				cc?: any;
				bcc?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'email';
			value: {
				message?: any;
				to?: any;
				subject?: any;
				from?: any;
				'meta-data'?: any;
				'send-as'?: any;
				'from-name'?: any;
				'reply-to'?: any;
				cc?: any;
				bcc?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'email';
};
type EmailPropValue = z.infer<typeof emailPropTypeUtil.schema>;

declare const selectionSizePropTypeUtil: {
	extract: (prop: unknown) => {
		selection:
			| {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
			  }
			| {
					$$type: 'key-value';
					value: {
						value?: any;
						key?: any;
					};
					disabled?: boolean | undefined;
			  };
		size?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'selection-size',
		{
			selection:
				| {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'key-value';
						value: {
							value?: any;
							key?: any;
						};
						disabled?: boolean | undefined;
				  };
			size?: any;
		}
	>;
	create: {
		(value: {
			selection:
				| {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'key-value';
						value: {
							value?: any;
							key?: any;
						};
						disabled?: boolean | undefined;
				  };
			size?: any;
		}): TransformablePropValue$1<
			'selection-size',
			{
				selection:
					| {
							$$type: 'string';
							value: string | null;
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'key-value';
							value: {
								value?: any;
								key?: any;
							};
							disabled?: boolean | undefined;
					  };
				size?: any;
			}
		>;
		(
			value: {
				selection:
					| {
							$$type: 'string';
							value: string | null;
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'key-value';
							value: {
								value?: any;
								key?: any;
							};
							disabled?: boolean | undefined;
					  };
				size?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'selection-size',
			{
				selection:
					| {
							$$type: 'string';
							value: string | null;
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'key-value';
							value: {
								value?: any;
								key?: any;
							};
							disabled?: boolean | undefined;
					  };
				size?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							selection:
								| {
										$$type: 'string';
										value: string | null;
										disabled?: boolean | undefined;
								  }
								| {
										$$type: 'key-value';
										value: {
											value?: any;
											key?: any;
										};
										disabled?: boolean | undefined;
								  };
							size?: any;
					  }
					| undefined
			) => {
				selection:
					| {
							$$type: 'string';
							value: string | null;
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'key-value';
							value: {
								value?: any;
								key?: any;
							};
							disabled?: boolean | undefined;
					  };
				size?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'selection-size',
			{
				selection:
					| {
							$$type: 'string';
							value: string | null;
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'key-value';
							value: {
								value?: any;
								key?: any;
							};
							disabled?: boolean | undefined;
					  };
				size?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'selection-size'>;
			value: z.ZodType<
				{
					selection:
						| {
								$$type: 'string';
								value: string | null;
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'key-value';
								value: {
									value?: any;
									key?: any;
								};
								disabled?: boolean | undefined;
						  };
					size?: any;
				},
				z.ZodTypeDef,
				{
					selection:
						| {
								$$type: 'string';
								value: string | null;
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'key-value';
								value: {
									value?: any;
									key?: any;
								};
								disabled?: boolean | undefined;
						  };
					size?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'selection-size';
			value: {
				selection:
					| {
							$$type: 'string';
							value: string | null;
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'key-value';
							value: {
								value?: any;
								key?: any;
							};
							disabled?: boolean | undefined;
					  };
				size?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'selection-size';
			value: {
				selection:
					| {
							$$type: 'string';
							value: string | null;
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'key-value';
							value: {
								value?: any;
								key?: any;
							};
							disabled?: boolean | undefined;
					  };
				size?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'selection-size';
};
type SelectionSizePropValue = z.infer<typeof selectionSizePropTypeUtil.schema>;

declare const backgroundPropTypeUtil: {
	extract: (prop: unknown) => {
		color?: any;
		clip?: any;
		'background-overlay'?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'background',
		{
			color?: any;
			clip?: any;
			'background-overlay'?: any;
		}
	>;
	create: {
		(value: { color?: any; clip?: any; 'background-overlay'?: any }): TransformablePropValue$1<
			'background',
			{
				color?: any;
				clip?: any;
				'background-overlay'?: any;
			}
		>;
		(
			value: {
				color?: any;
				clip?: any;
				'background-overlay'?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'background',
			{
				color?: any;
				clip?: any;
				'background-overlay'?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							color?: any;
							clip?: any;
							'background-overlay'?: any;
					  }
					| undefined
			) => {
				color?: any;
				clip?: any;
				'background-overlay'?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'background',
			{
				color?: any;
				clip?: any;
				'background-overlay'?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'background'>;
			value: z.ZodType<
				{
					color?: any;
					clip?: any;
					'background-overlay'?: any;
				},
				z.ZodTypeDef,
				{
					color?: any;
					clip?: any;
					'background-overlay'?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'background';
			value: {
				color?: any;
				clip?: any;
				'background-overlay'?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'background';
			value: {
				color?: any;
				clip?: any;
				'background-overlay'?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'background';
};
type BackgroundPropValue = z.infer<typeof backgroundPropTypeUtil.schema>;

declare const backgroundOverlayItem: z.ZodUnion<
	[
		z.ZodUnion<
			[
				z.ZodObject<
					{
						$$type: z.ZodLiteral<'background-color-overlay'>;
						value: z.ZodType<any, z.ZodTypeDef, any>;
						disabled: z.ZodOptional<z.ZodBoolean>;
					},
					'strict',
					z.ZodTypeAny,
					{
						$$type: 'background-color-overlay';
						value?: any;
						disabled?: boolean | undefined;
					},
					{
						$$type: 'background-color-overlay';
						value?: any;
						disabled?: boolean | undefined;
					}
				>,
				z.ZodObject<
					{
						$$type: z.ZodLiteral<'background-gradient-overlay'>;
						value: z.ZodType<any, z.ZodTypeDef, any>;
						disabled: z.ZodOptional<z.ZodBoolean>;
					},
					'strict',
					z.ZodTypeAny,
					{
						$$type: 'background-gradient-overlay';
						value?: any;
						disabled?: boolean | undefined;
					},
					{
						$$type: 'background-gradient-overlay';
						value?: any;
						disabled?: boolean | undefined;
					}
				>,
			]
		>,
		z.ZodObject<
			{
				$$type: z.ZodLiteral<'background-image-overlay'>;
				value: z.ZodType<any, z.ZodTypeDef, any>;
				disabled: z.ZodOptional<z.ZodBoolean>;
			},
			'strict',
			z.ZodTypeAny,
			{
				$$type: 'background-image-overlay';
				value?: any;
				disabled?: boolean | undefined;
			},
			{
				$$type: 'background-image-overlay';
				value?: any;
				disabled?: boolean | undefined;
			}
		>,
	]
>;
declare const backgroundOverlayPropTypeUtil: {
	extract: (prop: unknown) =>
		| (
				| {
						$$type: 'background-color-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-gradient-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-image-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
		  )[]
		| null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'background-overlay',
		(
			| {
					$$type: 'background-color-overlay';
					value?: any;
					disabled?: boolean | undefined;
			  }
			| {
					$$type: 'background-gradient-overlay';
					value?: any;
					disabled?: boolean | undefined;
			  }
			| {
					$$type: 'background-image-overlay';
					value?: any;
					disabled?: boolean | undefined;
			  }
		)[]
	>;
	create: {
		(
			value: (
				| {
						$$type: 'background-color-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-gradient-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-image-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
			)[]
		): TransformablePropValue$1<
			'background-overlay',
			(
				| {
						$$type: 'background-color-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-gradient-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-image-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
			)[]
		>;
		(
			value: (
				| {
						$$type: 'background-color-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-gradient-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-image-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
			)[],
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'background-overlay',
			(
				| {
						$$type: 'background-color-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-gradient-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-image-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
			)[]
		>;
		(
			value: (
				prev?:
					| (
							| {
									$$type: 'background-color-overlay';
									value?: any;
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'background-gradient-overlay';
									value?: any;
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'background-image-overlay';
									value?: any;
									disabled?: boolean | undefined;
							  }
					  )[]
					| undefined
			) => (
				| {
						$$type: 'background-color-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-gradient-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-image-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
			)[],
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'background-overlay',
			(
				| {
						$$type: 'background-color-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-gradient-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-image-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
			)[]
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'background-overlay'>;
			value: z.ZodType<
				(
					| {
							$$type: 'background-color-overlay';
							value?: any;
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'background-gradient-overlay';
							value?: any;
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'background-image-overlay';
							value?: any;
							disabled?: boolean | undefined;
					  }
				)[],
				z.ZodTypeDef,
				(
					| {
							$$type: 'background-color-overlay';
							value?: any;
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'background-gradient-overlay';
							value?: any;
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'background-image-overlay';
							value?: any;
							disabled?: boolean | undefined;
					  }
				)[]
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'background-overlay';
			value: (
				| {
						$$type: 'background-color-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-gradient-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-image-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
			)[];
			disabled?: boolean | undefined;
		},
		{
			$$type: 'background-overlay';
			value: (
				| {
						$$type: 'background-color-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-gradient-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'background-image-overlay';
						value?: any;
						disabled?: boolean | undefined;
				  }
			)[];
			disabled?: boolean | undefined;
		}
	>;
	key: 'background-overlay';
};
type BackgroundOverlayPropValue = z.infer<typeof backgroundOverlayPropTypeUtil.schema>;
type BackgroundOverlayItemPropValue = z.infer<typeof backgroundOverlayItem>;

declare const backgroundColorOverlayPropTypeUtil: {
	extract: (prop: unknown) => any;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'background-color-overlay', any>;
	create: {
		(value: any): TransformablePropValue$1<'background-color-overlay', any>;
		(value: any, createOptions?: CreateOptions): TransformablePropValue$1<'background-color-overlay', any>;
		(
			value: (prev?: any) => any,
			createOptions: CreateOptions
		): TransformablePropValue$1<'background-color-overlay', any>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'background-color-overlay'>;
			value: z.ZodType<any, z.ZodTypeDef, any>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'background-color-overlay';
			value?: any;
			disabled?: boolean | undefined;
		},
		{
			$$type: 'background-color-overlay';
			value?: any;
			disabled?: boolean | undefined;
		}
	>;
	key: 'background-color-overlay';
};
type BackgroundColorOverlayPropValue = z.infer<typeof backgroundColorOverlayPropTypeUtil.schema>;

declare const backgroundImageOverlayPropTypeUtil: {
	extract: (prop: unknown) => any;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'background-image-overlay', any>;
	create: {
		(value: any): TransformablePropValue$1<'background-image-overlay', any>;
		(value: any, createOptions?: CreateOptions): TransformablePropValue$1<'background-image-overlay', any>;
		(
			value: (prev?: any) => any,
			createOptions: CreateOptions
		): TransformablePropValue$1<'background-image-overlay', any>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'background-image-overlay'>;
			value: z.ZodType<any, z.ZodTypeDef, any>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'background-image-overlay';
			value?: any;
			disabled?: boolean | undefined;
		},
		{
			$$type: 'background-image-overlay';
			value?: any;
			disabled?: boolean | undefined;
		}
	>;
	key: 'background-image-overlay';
};
type BackgroundImageOverlayPropValue = z.infer<typeof backgroundImageOverlayPropTypeUtil.schema>;

declare const backgroundGradientOverlayPropTypeUtil: {
	extract: (prop: unknown) => any;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'background-gradient-overlay', any>;
	create: {
		(value: any): TransformablePropValue$1<'background-gradient-overlay', any>;
		(value: any, createOptions?: CreateOptions): TransformablePropValue$1<'background-gradient-overlay', any>;
		(
			value: (prev?: any) => any,
			createOptions: CreateOptions
		): TransformablePropValue$1<'background-gradient-overlay', any>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'background-gradient-overlay'>;
			value: z.ZodType<any, z.ZodTypeDef, any>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'background-gradient-overlay';
			value?: any;
			disabled?: boolean | undefined;
		},
		{
			$$type: 'background-gradient-overlay';
			value?: any;
			disabled?: boolean | undefined;
		}
	>;
	key: 'background-gradient-overlay';
};
type BackgroundGradientOverlayPropValue = z.infer<typeof backgroundGradientOverlayPropTypeUtil.schema>;

declare const backgroundImagePositionOffsetPropTypeUtil: {
	extract: (prop: unknown) => any;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'background-image-position-offset', any>;
	create: {
		(value: any): TransformablePropValue$1<'background-image-position-offset', any>;
		(value: any, createOptions?: CreateOptions): TransformablePropValue$1<'background-image-position-offset', any>;
		(
			value: (prev?: any) => any,
			createOptions: CreateOptions
		): TransformablePropValue$1<'background-image-position-offset', any>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'background-image-position-offset'>;
			value: z.ZodType<any, z.ZodTypeDef, any>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'background-image-position-offset';
			value?: any;
			disabled?: boolean | undefined;
		},
		{
			$$type: 'background-image-position-offset';
			value?: any;
			disabled?: boolean | undefined;
		}
	>;
	key: 'background-image-position-offset';
};
type BackgroundImagePositionOffsetPropValue = z.infer<typeof backgroundImagePositionOffsetPropTypeUtil.schema>;

declare const backgroundImageSizeScalePropTypeUtil: {
	extract: (prop: unknown) => any;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'background-image-size-scale', any>;
	create: {
		(value: any): TransformablePropValue$1<'background-image-size-scale', any>;
		(value: any, createOptions?: CreateOptions): TransformablePropValue$1<'background-image-size-scale', any>;
		(
			value: (prev?: any) => any,
			createOptions: CreateOptions
		): TransformablePropValue$1<'background-image-size-scale', any>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'background-image-size-scale'>;
			value: z.ZodType<any, z.ZodTypeDef, any>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'background-image-size-scale';
			value?: any;
			disabled?: boolean | undefined;
		},
		{
			$$type: 'background-image-size-scale';
			value?: any;
			disabled?: boolean | undefined;
		}
	>;
	key: 'background-image-size-scale';
};
type BackgroundImageSizeScalePropValue = z.infer<typeof backgroundImageSizeScalePropTypeUtil.schema>;

declare const booleanPropTypeUtil: {
	extract: (prop: unknown) => boolean | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'boolean', boolean | null>;
	create: {
		(value: boolean | null): TransformablePropValue$1<'boolean', boolean | null>;
		(value: boolean | null, createOptions?: CreateOptions): TransformablePropValue$1<'boolean', boolean | null>;
		(
			value: (prev?: boolean | null | undefined) => boolean | null,
			createOptions: CreateOptions
		): TransformablePropValue$1<'boolean', boolean | null>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'boolean'>;
			value: z.ZodType<boolean | null, z.ZodTypeDef, boolean | null>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'boolean';
			value: boolean | null;
			disabled?: boolean | undefined;
		},
		{
			$$type: 'boolean';
			value: boolean | null;
			disabled?: boolean | undefined;
		}
	>;
	key: 'boolean';
};
type BooleanPropValue = z.infer<typeof booleanPropTypeUtil.schema>;

declare const colorStopPropTypeUtil: {
	extract: (prop: unknown) => {
		color?: any;
		offset?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'color-stop',
		{
			color?: any;
			offset?: any;
		}
	>;
	create: {
		(value: { color?: any; offset?: any }): TransformablePropValue$1<
			'color-stop',
			{
				color?: any;
				offset?: any;
			}
		>;
		(
			value: {
				color?: any;
				offset?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'color-stop',
			{
				color?: any;
				offset?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							color?: any;
							offset?: any;
					  }
					| undefined
			) => {
				color?: any;
				offset?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'color-stop',
			{
				color?: any;
				offset?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'color-stop'>;
			value: z.ZodType<
				{
					color?: any;
					offset?: any;
				},
				z.ZodTypeDef,
				{
					color?: any;
					offset?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'color-stop';
			value: {
				color?: any;
				offset?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'color-stop';
			value: {
				color?: any;
				offset?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'color-stop';
};
type ColorStopPropValue = z.infer<typeof colorStopPropTypeUtil.schema>;

declare const gradientColorStopPropTypeUtil: {
	extract: (prop: unknown) =>
		| {
				$$type: 'color-stop';
				value: {
					color?: any;
					offset?: any;
				};
				disabled?: boolean | undefined;
		  }[]
		| null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'gradient-color-stop',
		{
			$$type: 'color-stop';
			value: {
				color?: any;
				offset?: any;
			};
			disabled?: boolean | undefined;
		}[]
	>;
	create: {
		(
			value: {
				$$type: 'color-stop';
				value: {
					color?: any;
					offset?: any;
				};
				disabled?: boolean | undefined;
			}[]
		): TransformablePropValue$1<
			'gradient-color-stop',
			{
				$$type: 'color-stop';
				value: {
					color?: any;
					offset?: any;
				};
				disabled?: boolean | undefined;
			}[]
		>;
		(
			value: {
				$$type: 'color-stop';
				value: {
					color?: any;
					offset?: any;
				};
				disabled?: boolean | undefined;
			}[],
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'gradient-color-stop',
			{
				$$type: 'color-stop';
				value: {
					color?: any;
					offset?: any;
				};
				disabled?: boolean | undefined;
			}[]
		>;
		(
			value: (
				prev?:
					| {
							$$type: 'color-stop';
							value: {
								color?: any;
								offset?: any;
							};
							disabled?: boolean | undefined;
					  }[]
					| undefined
			) => {
				$$type: 'color-stop';
				value: {
					color?: any;
					offset?: any;
				};
				disabled?: boolean | undefined;
			}[],
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'gradient-color-stop',
			{
				$$type: 'color-stop';
				value: {
					color?: any;
					offset?: any;
				};
				disabled?: boolean | undefined;
			}[]
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'gradient-color-stop'>;
			value: z.ZodType<
				{
					$$type: 'color-stop';
					value: {
						color?: any;
						offset?: any;
					};
					disabled?: boolean | undefined;
				}[],
				z.ZodTypeDef,
				{
					$$type: 'color-stop';
					value: {
						color?: any;
						offset?: any;
					};
					disabled?: boolean | undefined;
				}[]
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'gradient-color-stop';
			value: {
				$$type: 'color-stop';
				value: {
					color?: any;
					offset?: any;
				};
				disabled?: boolean | undefined;
			}[];
			disabled?: boolean | undefined;
		},
		{
			$$type: 'gradient-color-stop';
			value: {
				$$type: 'color-stop';
				value: {
					color?: any;
					offset?: any;
				};
				disabled?: boolean | undefined;
			}[];
			disabled?: boolean | undefined;
		}
	>;
	key: 'gradient-color-stop';
};
type GradientColorStopPropValue = z.infer<typeof gradientColorStopPropTypeUtil.schema>;

declare const keyValuePropTypeUtil: {
	extract: (prop: unknown) => {
		value?: any;
		key?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'key-value',
		{
			value?: any;
			key?: any;
		}
	>;
	create: {
		(value: { value?: any; key?: any }): TransformablePropValue$1<
			'key-value',
			{
				value?: any;
				key?: any;
			}
		>;
		(
			value: {
				value?: any;
				key?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'key-value',
			{
				value?: any;
				key?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							value?: any;
							key?: any;
					  }
					| undefined
			) => {
				value?: any;
				key?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'key-value',
			{
				value?: any;
				key?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'key-value'>;
			value: z.ZodType<
				{
					value?: any;
					key?: any;
				},
				z.ZodTypeDef,
				{
					value?: any;
					key?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'key-value';
			value: {
				value?: any;
				key?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'key-value';
			value: {
				value?: any;
				key?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'key-value';
};
type KeyValuePropValue = z.infer<typeof keyValuePropTypeUtil.schema>;

declare const DateTimePropTypeUtil: {
	extract: (prop: unknown) => {
		date?: any;
		time?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'date-time',
		{
			date?: any;
			time?: any;
		}
	>;
	create: {
		(value: { date?: any; time?: any }): TransformablePropValue$1<
			'date-time',
			{
				date?: any;
				time?: any;
			}
		>;
		(
			value: {
				date?: any;
				time?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'date-time',
			{
				date?: any;
				time?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							date?: any;
							time?: any;
					  }
					| undefined
			) => {
				date?: any;
				time?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'date-time',
			{
				date?: any;
				time?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'date-time'>;
			value: z.ZodType<
				{
					date?: any;
					time?: any;
				},
				z.ZodTypeDef,
				{
					date?: any;
					time?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'date-time';
			value: {
				date?: any;
				time?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'date-time';
			value: {
				date?: any;
				time?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'date-time';
};
type DateTimePropValue = z.infer<typeof DateTimePropTypeUtil.schema>;

declare const positionPropTypeUtil: {
	extract: (prop: unknown) => {
		x?: any;
		y?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'object-position',
		{
			x?: any;
			y?: any;
		}
	>;
	create: {
		(value: { x?: any; y?: any }): TransformablePropValue$1<
			'object-position',
			{
				x?: any;
				y?: any;
			}
		>;
		(
			value: {
				x?: any;
				y?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'object-position',
			{
				x?: any;
				y?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							x?: any;
							y?: any;
					  }
					| undefined
			) => {
				x?: any;
				y?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'object-position',
			{
				x?: any;
				y?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'object-position'>;
			value: z.ZodType<
				{
					x?: any;
					y?: any;
				},
				z.ZodTypeDef,
				{
					x?: any;
					y?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'object-position';
			value: {
				x?: any;
				y?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'object-position';
			value: {
				x?: any;
				y?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'object-position';
};
type PositionPropTypeValue = z.infer<typeof positionPropTypeUtil.schema>;

declare const queryPropTypeUtil: {
	extract: (prop: unknown) => {
		id?: any;
		label?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'query',
		{
			id?: any;
			label?: any;
		}
	>;
	create: {
		(value: { id?: any; label?: any }): TransformablePropValue$1<
			'query',
			{
				id?: any;
				label?: any;
			}
		>;
		(
			value: {
				id?: any;
				label?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'query',
			{
				id?: any;
				label?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							id?: any;
							label?: any;
					  }
					| undefined
			) => {
				id?: any;
				label?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'query',
			{
				id?: any;
				label?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'query'>;
			value: z.ZodType<
				{
					id?: any;
					label?: any;
				},
				z.ZodTypeDef,
				{
					id?: any;
					label?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'query';
			value: {
				id?: any;
				label?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'query';
			value: {
				id?: any;
				label?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'query';
};
type QueryPropValue = z.infer<typeof queryPropTypeUtil.schema>;

declare const htmlPropTypeUtil: {
	extract: (prop: unknown) => string | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<'html', string | null>;
	create: {
		(value: string | null): TransformablePropValue$1<'html', string | null>;
		(value: string | null, createOptions?: CreateOptions): TransformablePropValue$1<'html', string | null>;
		(
			value: (prev?: string | null | undefined) => string | null,
			createOptions: CreateOptions
		): TransformablePropValue$1<'html', string | null>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'html'>;
			value: z.ZodType<string | null, z.ZodTypeDef, string | null>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'html';
			value: string | null;
			disabled?: boolean | undefined;
		},
		{
			$$type: 'html';
			value: string | null;
			disabled?: boolean | undefined;
		}
	>;
	key: 'html';
};
type HtmlPropValue = z.infer<typeof htmlPropTypeUtil.schema>;

interface ChildElement {
	id: string;
	type: string;
	content?: string;
	children?: ChildElement[];
}
declare const htmlV2ValueSchema: z.ZodObject<
	{
		content: z.ZodNullable<z.ZodString>;
		children: z.ZodArray<z.ZodType<ChildElement, z.ZodTypeDef, ChildElement>, 'many'>;
	},
	'strip',
	z.ZodTypeAny,
	{
		content: string | null;
		children: ChildElement[];
	},
	{
		content: string | null;
		children: ChildElement[];
	}
>;
declare const htmlV2PropTypeUtil: {
	extract: (prop: unknown) => {
		content: string | null;
		children: ChildElement[];
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'html-v2',
		{
			content: string | null;
			children: ChildElement[];
		}
	>;
	create: {
		(value: { content: string | null; children: ChildElement[] }): TransformablePropValue$1<
			'html-v2',
			{
				content: string | null;
				children: ChildElement[];
			}
		>;
		(
			value: {
				content: string | null;
				children: ChildElement[];
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'html-v2',
			{
				content: string | null;
				children: ChildElement[];
			}
		>;
		(
			value: (
				prev?:
					| {
							content: string | null;
							children: ChildElement[];
					  }
					| undefined
			) => {
				content: string | null;
				children: ChildElement[];
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'html-v2',
			{
				content: string | null;
				children: ChildElement[];
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'html-v2'>;
			value: z.ZodType<
				{
					content: string | null;
					children: ChildElement[];
				},
				z.ZodTypeDef,
				{
					content: string | null;
					children: ChildElement[];
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'html-v2';
			value: {
				content: string | null;
				children: ChildElement[];
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'html-v2';
			value: {
				content: string | null;
				children: ChildElement[];
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'html-v2';
};
type HtmlV2PropValue = z.infer<typeof htmlV2PropTypeUtil.schema>;
type HtmlV2Value = z.infer<typeof htmlV2ValueSchema>;

declare const htmlV3ValueSchema: z.ZodObject<
	{
		content: z.ZodNullable<
			z.ZodObject<
				{
					$$type: z.ZodLiteral<'string'>;
					value: z.ZodType<string | null, z.ZodTypeDef, string | null>;
					disabled: z.ZodOptional<z.ZodBoolean>;
				},
				'strict',
				z.ZodTypeAny,
				{
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				},
				{
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				}
			>
		>;
		children: z.ZodArray<z.ZodUnknown, 'many'>;
	},
	'strip',
	z.ZodTypeAny,
	{
		content: {
			$$type: 'string';
			value: string | null;
			disabled?: boolean | undefined;
		} | null;
		children: unknown[];
	},
	{
		content: {
			$$type: 'string';
			value: string | null;
			disabled?: boolean | undefined;
		} | null;
		children: unknown[];
	}
>;
declare const htmlV3PropTypeUtil: {
	extract: (prop: unknown) => {
		content: {
			$$type: 'string';
			value: string | null;
			disabled?: boolean | undefined;
		} | null;
		children: unknown[];
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'html-v3',
		{
			content: {
				$$type: 'string';
				value: string | null;
				disabled?: boolean | undefined;
			} | null;
			children: unknown[];
		}
	>;
	create: {
		(value: {
			content: {
				$$type: 'string';
				value: string | null;
				disabled?: boolean | undefined;
			} | null;
			children: unknown[];
		}): TransformablePropValue$1<
			'html-v3',
			{
				content: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				} | null;
				children: unknown[];
			}
		>;
		(
			value: {
				content: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				} | null;
				children: unknown[];
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'html-v3',
			{
				content: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				} | null;
				children: unknown[];
			}
		>;
		(
			value: (
				prev?:
					| {
							content: {
								$$type: 'string';
								value: string | null;
								disabled?: boolean | undefined;
							} | null;
							children: unknown[];
					  }
					| undefined
			) => {
				content: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				} | null;
				children: unknown[];
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'html-v3',
			{
				content: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				} | null;
				children: unknown[];
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'html-v3'>;
			value: z.ZodType<
				{
					content: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					} | null;
					children: unknown[];
				},
				z.ZodTypeDef,
				{
					content: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					} | null;
					children: unknown[];
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'html-v3';
			value: {
				content: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				} | null;
				children: unknown[];
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'html-v3';
			value: {
				content: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				} | null;
				children: unknown[];
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'html-v3';
};
type HtmlV3PropValue = z.infer<typeof htmlV3PropTypeUtil.schema>;
type HtmlV3Value = z.infer<typeof htmlV3ValueSchema>;

declare const cssFilterFunctionPropUtil: {
	extract: (prop: unknown) => {
		func: {
			$$type: 'string';
			value: string | null;
			disabled?: boolean | undefined;
		};
		args:
			| {
					$$type: 'drop-shadow';
					value: {
						blur?: any;
						color?: any;
						xAxis?: any;
						yAxis?: any;
					};
					disabled?: boolean | undefined;
			  }
			| {
					$$type: 'blur';
					value: {
						size?: any;
					};
					disabled?: boolean | undefined;
			  }
			| {
					$$type: 'color-tone';
					value: {
						size?: any;
					};
					disabled?: boolean | undefined;
			  }
			| {
					$$type: 'hue-rotate';
					value: {
						size?: any;
					};
					disabled?: boolean | undefined;
			  }
			| {
					$$type: 'intensity';
					value: {
						size?: any;
					};
					disabled?: boolean | undefined;
			  };
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'css-filter-func',
		{
			func: {
				$$type: 'string';
				value: string | null;
				disabled?: boolean | undefined;
			};
			args:
				| {
						$$type: 'drop-shadow';
						value: {
							blur?: any;
							color?: any;
							xAxis?: any;
							yAxis?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'blur';
						value: {
							size?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'color-tone';
						value: {
							size?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'hue-rotate';
						value: {
							size?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'intensity';
						value: {
							size?: any;
						};
						disabled?: boolean | undefined;
				  };
		}
	>;
	create: {
		(value: {
			func: {
				$$type: 'string';
				value: string | null;
				disabled?: boolean | undefined;
			};
			args:
				| {
						$$type: 'drop-shadow';
						value: {
							blur?: any;
							color?: any;
							xAxis?: any;
							yAxis?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'blur';
						value: {
							size?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'color-tone';
						value: {
							size?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'hue-rotate';
						value: {
							size?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'intensity';
						value: {
							size?: any;
						};
						disabled?: boolean | undefined;
				  };
		}): TransformablePropValue$1<
			'css-filter-func',
			{
				func: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				};
				args:
					| {
							$$type: 'drop-shadow';
							value: {
								blur?: any;
								color?: any;
								xAxis?: any;
								yAxis?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'blur';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'color-tone';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'hue-rotate';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'intensity';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  };
			}
		>;
		(
			value: {
				func: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				};
				args:
					| {
							$$type: 'drop-shadow';
							value: {
								blur?: any;
								color?: any;
								xAxis?: any;
								yAxis?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'blur';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'color-tone';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'hue-rotate';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'intensity';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  };
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'css-filter-func',
			{
				func: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				};
				args:
					| {
							$$type: 'drop-shadow';
							value: {
								blur?: any;
								color?: any;
								xAxis?: any;
								yAxis?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'blur';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'color-tone';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'hue-rotate';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'intensity';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  };
			}
		>;
		(
			value: (
				prev?:
					| {
							func: {
								$$type: 'string';
								value: string | null;
								disabled?: boolean | undefined;
							};
							args:
								| {
										$$type: 'drop-shadow';
										value: {
											blur?: any;
											color?: any;
											xAxis?: any;
											yAxis?: any;
										};
										disabled?: boolean | undefined;
								  }
								| {
										$$type: 'blur';
										value: {
											size?: any;
										};
										disabled?: boolean | undefined;
								  }
								| {
										$$type: 'color-tone';
										value: {
											size?: any;
										};
										disabled?: boolean | undefined;
								  }
								| {
										$$type: 'hue-rotate';
										value: {
											size?: any;
										};
										disabled?: boolean | undefined;
								  }
								| {
										$$type: 'intensity';
										value: {
											size?: any;
										};
										disabled?: boolean | undefined;
								  };
					  }
					| undefined
			) => {
				func: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				};
				args:
					| {
							$$type: 'drop-shadow';
							value: {
								blur?: any;
								color?: any;
								xAxis?: any;
								yAxis?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'blur';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'color-tone';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'hue-rotate';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'intensity';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  };
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'css-filter-func',
			{
				func: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				};
				args:
					| {
							$$type: 'drop-shadow';
							value: {
								blur?: any;
								color?: any;
								xAxis?: any;
								yAxis?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'blur';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'color-tone';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'hue-rotate';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'intensity';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  };
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'css-filter-func'>;
			value: z.ZodType<
				{
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				},
				z.ZodTypeDef,
				{
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'css-filter-func';
			value: {
				func: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				};
				args:
					| {
							$$type: 'drop-shadow';
							value: {
								blur?: any;
								color?: any;
								xAxis?: any;
								yAxis?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'blur';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'color-tone';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'hue-rotate';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'intensity';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  };
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'css-filter-func';
			value: {
				func: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				};
				args:
					| {
							$$type: 'drop-shadow';
							value: {
								blur?: any;
								color?: any;
								xAxis?: any;
								yAxis?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'blur';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'color-tone';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'hue-rotate';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'intensity';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  };
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'css-filter-func';
};
declare const filterPropTypeUtil: {
	extract: (prop: unknown) =>
		| {
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
		  }[]
		| null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'filter',
		{
			$$type: 'css-filter-func';
			value: {
				func: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				};
				args:
					| {
							$$type: 'drop-shadow';
							value: {
								blur?: any;
								color?: any;
								xAxis?: any;
								yAxis?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'blur';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'color-tone';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'hue-rotate';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'intensity';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  };
			};
			disabled?: boolean | undefined;
		}[]
	>;
	create: {
		(
			value: {
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[]
		): TransformablePropValue$1<
			'filter',
			{
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[]
		>;
		(
			value: {
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[],
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'filter',
			{
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[]
		>;
		(
			value: (
				prev?:
					| {
							$$type: 'css-filter-func';
							value: {
								func: {
									$$type: 'string';
									value: string | null;
									disabled?: boolean | undefined;
								};
								args:
									| {
											$$type: 'drop-shadow';
											value: {
												blur?: any;
												color?: any;
												xAxis?: any;
												yAxis?: any;
											};
											disabled?: boolean | undefined;
									  }
									| {
											$$type: 'blur';
											value: {
												size?: any;
											};
											disabled?: boolean | undefined;
									  }
									| {
											$$type: 'color-tone';
											value: {
												size?: any;
											};
											disabled?: boolean | undefined;
									  }
									| {
											$$type: 'hue-rotate';
											value: {
												size?: any;
											};
											disabled?: boolean | undefined;
									  }
									| {
											$$type: 'intensity';
											value: {
												size?: any;
											};
											disabled?: boolean | undefined;
									  };
							};
							disabled?: boolean | undefined;
					  }[]
					| undefined
			) => {
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[],
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'filter',
			{
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[]
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'filter'>;
			value: z.ZodType<
				{
					$$type: 'css-filter-func';
					value: {
						func: {
							$$type: 'string';
							value: string | null;
							disabled?: boolean | undefined;
						};
						args:
							| {
									$$type: 'drop-shadow';
									value: {
										blur?: any;
										color?: any;
										xAxis?: any;
										yAxis?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'blur';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'color-tone';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'hue-rotate';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'intensity';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  };
					};
					disabled?: boolean | undefined;
				}[],
				z.ZodTypeDef,
				{
					$$type: 'css-filter-func';
					value: {
						func: {
							$$type: 'string';
							value: string | null;
							disabled?: boolean | undefined;
						};
						args:
							| {
									$$type: 'drop-shadow';
									value: {
										blur?: any;
										color?: any;
										xAxis?: any;
										yAxis?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'blur';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'color-tone';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'hue-rotate';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'intensity';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  };
					};
					disabled?: boolean | undefined;
				}[]
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'filter';
			value: {
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[];
			disabled?: boolean | undefined;
		},
		{
			$$type: 'filter';
			value: {
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[];
			disabled?: boolean | undefined;
		}
	>;
	key: 'filter';
};
type FilterItemPropValue = z.infer<typeof cssFilterFunctionPropUtil.schema>;
type FilterPropValue = z.infer<typeof filterPropTypeUtil.schema>;

declare const transformPropTypeUtil: {
	extract: (prop: unknown) => {
		'transform-functions'?: any;
		'transform-origin'?: any;
		perspective?: any;
		'perspective-origin'?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'transform',
		{
			'transform-functions'?: any;
			'transform-origin'?: any;
			perspective?: any;
			'perspective-origin'?: any;
		}
	>;
	create: {
		(value: {
			'transform-functions'?: any;
			'transform-origin'?: any;
			perspective?: any;
			'perspective-origin'?: any;
		}): TransformablePropValue$1<
			'transform',
			{
				'transform-functions'?: any;
				'transform-origin'?: any;
				perspective?: any;
				'perspective-origin'?: any;
			}
		>;
		(
			value: {
				'transform-functions'?: any;
				'transform-origin'?: any;
				perspective?: any;
				'perspective-origin'?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'transform',
			{
				'transform-functions'?: any;
				'transform-origin'?: any;
				perspective?: any;
				'perspective-origin'?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							'transform-functions'?: any;
							'transform-origin'?: any;
							perspective?: any;
							'perspective-origin'?: any;
					  }
					| undefined
			) => {
				'transform-functions'?: any;
				'transform-origin'?: any;
				perspective?: any;
				'perspective-origin'?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'transform',
			{
				'transform-functions'?: any;
				'transform-origin'?: any;
				perspective?: any;
				'perspective-origin'?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'transform'>;
			value: z.ZodType<
				{
					'transform-functions'?: any;
					'transform-origin'?: any;
					perspective?: any;
					'perspective-origin'?: any;
				},
				z.ZodTypeDef,
				{
					'transform-functions'?: any;
					'transform-origin'?: any;
					perspective?: any;
					'perspective-origin'?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'transform';
			value: {
				'transform-functions'?: any;
				'transform-origin'?: any;
				perspective?: any;
				'perspective-origin'?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'transform';
			value: {
				'transform-functions'?: any;
				'transform-origin'?: any;
				perspective?: any;
				'perspective-origin'?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'transform';
};
type TransformPropValue = z.infer<typeof transformPropTypeUtil.schema>;

declare const filterTypes: z.ZodUnion<
	[
		z.ZodUnion<
			[
				z.ZodUnion<
					[
						z.ZodObject<
							{
								$$type: z.ZodLiteral<
									'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew'
								>;
								value: z.ZodType<
									{
										x?: any;
										y?: any;
										z?: any;
									},
									z.ZodTypeDef,
									{
										x?: any;
										y?: any;
										z?: any;
									}
								>;
								disabled: z.ZodOptional<z.ZodBoolean>;
							},
							'strict',
							z.ZodTypeAny,
							{
								$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
								value: {
									x?: any;
									y?: any;
									z?: any;
								};
								disabled?: boolean | undefined;
							},
							{
								$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
								value: {
									x?: any;
									y?: any;
									z?: any;
								};
								disabled?: boolean | undefined;
							}
						>,
						z.ZodObject<
							{
								$$type: z.ZodLiteral<
									'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew'
								>;
								value: z.ZodType<
									{
										x: {
											$$type: 'number';
											value: number | null;
											disabled?: boolean | undefined;
										} | null;
										y: {
											$$type: 'number';
											value: number | null;
											disabled?: boolean | undefined;
										} | null;
										z: {
											$$type: 'number';
											value: number | null;
											disabled?: boolean | undefined;
										} | null;
									},
									z.ZodTypeDef,
									{
										x: {
											$$type: 'number';
											value: number | null;
											disabled?: boolean | undefined;
										} | null;
										y: {
											$$type: 'number';
											value: number | null;
											disabled?: boolean | undefined;
										} | null;
										z: {
											$$type: 'number';
											value: number | null;
											disabled?: boolean | undefined;
										} | null;
									}
								>;
								disabled: z.ZodOptional<z.ZodBoolean>;
							},
							'strict',
							z.ZodTypeAny,
							{
								$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
								value: {
									x: {
										$$type: 'number';
										value: number | null;
										disabled?: boolean | undefined;
									} | null;
									y: {
										$$type: 'number';
										value: number | null;
										disabled?: boolean | undefined;
									} | null;
									z: {
										$$type: 'number';
										value: number | null;
										disabled?: boolean | undefined;
									} | null;
								};
								disabled?: boolean | undefined;
							},
							{
								$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
								value: {
									x: {
										$$type: 'number';
										value: number | null;
										disabled?: boolean | undefined;
									} | null;
									y: {
										$$type: 'number';
										value: number | null;
										disabled?: boolean | undefined;
									} | null;
									z: {
										$$type: 'number';
										value: number | null;
										disabled?: boolean | undefined;
									} | null;
								};
								disabled?: boolean | undefined;
							}
						>,
					]
				>,
				z.ZodObject<
					{
						$$type: z.ZodLiteral<
							'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew'
						>;
						value: z.ZodType<
							{
								x?: any;
								y?: any;
								z?: any;
							},
							z.ZodTypeDef,
							{
								x?: any;
								y?: any;
								z?: any;
							}
						>;
						disabled: z.ZodOptional<z.ZodBoolean>;
					},
					'strict',
					z.ZodTypeAny,
					{
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
					},
					{
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
					}
				>,
			]
		>,
		z.ZodObject<
			{
				$$type: z.ZodLiteral<'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew'>;
				value: z.ZodType<
					{
						x?: any;
						y?: any;
					},
					z.ZodTypeDef,
					{
						x?: any;
						y?: any;
					}
				>;
				disabled: z.ZodOptional<z.ZodBoolean>;
			},
			'strict',
			z.ZodTypeAny,
			{
				$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
				value: {
					x?: any;
					y?: any;
				};
				disabled?: boolean | undefined;
			},
			{
				$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
				value: {
					x?: any;
					y?: any;
				};
				disabled?: boolean | undefined;
			}
		>,
	]
>;
declare const transformFunctionsPropTypeUtil: {
	extract: (prop: unknown) =>
		| (
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							y: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							z: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
						};
						disabled?: boolean | undefined;
				  }
		  )[]
		| null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'transform-functions',
		(
			| {
					$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
					value: {
						x?: any;
						y?: any;
						z?: any;
					};
					disabled?: boolean | undefined;
			  }
			| {
					$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
					value: {
						x?: any;
						y?: any;
						z?: any;
					};
					disabled?: boolean | undefined;
			  }
			| {
					$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
					value: {
						x: {
							$$type: 'number';
							value: number | null;
							disabled?: boolean | undefined;
						} | null;
						y: {
							$$type: 'number';
							value: number | null;
							disabled?: boolean | undefined;
						} | null;
						z: {
							$$type: 'number';
							value: number | null;
							disabled?: boolean | undefined;
						} | null;
					};
					disabled?: boolean | undefined;
			  }
			| {
					$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
					value: {
						x?: any;
						y?: any;
					};
					disabled?: boolean | undefined;
			  }
		)[]
	>;
	create: {
		(
			value: (
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							y: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							z: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
						};
						disabled?: boolean | undefined;
				  }
			)[]
		): TransformablePropValue$1<
			'transform-functions',
			(
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							y: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							z: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
						};
						disabled?: boolean | undefined;
				  }
			)[]
		>;
		(
			value: (
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							y: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							z: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
						};
						disabled?: boolean | undefined;
				  }
			)[],
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'transform-functions',
			(
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							y: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							z: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
						};
						disabled?: boolean | undefined;
				  }
			)[]
		>;
		(
			value: (
				prev?:
					| (
							| {
									$$type:
										| 'transform-move'
										| 'transform-scale'
										| 'transform-rotate'
										| 'transform-skew';
									value: {
										x?: any;
										y?: any;
										z?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type:
										| 'transform-move'
										| 'transform-scale'
										| 'transform-rotate'
										| 'transform-skew';
									value: {
										x?: any;
										y?: any;
										z?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type:
										| 'transform-move'
										| 'transform-scale'
										| 'transform-rotate'
										| 'transform-skew';
									value: {
										x: {
											$$type: 'number';
											value: number | null;
											disabled?: boolean | undefined;
										} | null;
										y: {
											$$type: 'number';
											value: number | null;
											disabled?: boolean | undefined;
										} | null;
										z: {
											$$type: 'number';
											value: number | null;
											disabled?: boolean | undefined;
										} | null;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type:
										| 'transform-move'
										| 'transform-scale'
										| 'transform-rotate'
										| 'transform-skew';
									value: {
										x?: any;
										y?: any;
									};
									disabled?: boolean | undefined;
							  }
					  )[]
					| undefined
			) => (
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							y: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							z: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
						};
						disabled?: boolean | undefined;
				  }
			)[],
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'transform-functions',
			(
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							y: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							z: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
						};
						disabled?: boolean | undefined;
				  }
			)[]
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'transform-functions'>;
			value: z.ZodType<
				(
					| {
							$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
							value: {
								x?: any;
								y?: any;
								z?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
							value: {
								x?: any;
								y?: any;
								z?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
							value: {
								x: {
									$$type: 'number';
									value: number | null;
									disabled?: boolean | undefined;
								} | null;
								y: {
									$$type: 'number';
									value: number | null;
									disabled?: boolean | undefined;
								} | null;
								z: {
									$$type: 'number';
									value: number | null;
									disabled?: boolean | undefined;
								} | null;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
							value: {
								x?: any;
								y?: any;
							};
							disabled?: boolean | undefined;
					  }
				)[],
				z.ZodTypeDef,
				(
					| {
							$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
							value: {
								x?: any;
								y?: any;
								z?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
							value: {
								x?: any;
								y?: any;
								z?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
							value: {
								x: {
									$$type: 'number';
									value: number | null;
									disabled?: boolean | undefined;
								} | null;
								y: {
									$$type: 'number';
									value: number | null;
									disabled?: boolean | undefined;
								} | null;
								z: {
									$$type: 'number';
									value: number | null;
									disabled?: boolean | undefined;
								} | null;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
							value: {
								x?: any;
								y?: any;
							};
							disabled?: boolean | undefined;
					  }
				)[]
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'transform-functions';
			value: (
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							y: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							z: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
						};
						disabled?: boolean | undefined;
				  }
			)[];
			disabled?: boolean | undefined;
		},
		{
			$$type: 'transform-functions';
			value: (
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
							z?: any;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							y: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							z: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
						};
						disabled?: boolean | undefined;
				  }
				| {
						$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
						value: {
							x?: any;
							y?: any;
						};
						disabled?: boolean | undefined;
				  }
			)[];
			disabled?: boolean | undefined;
		}
	>;
	key: 'transform-functions';
};
type TransformFunctionsPropValue = z.infer<typeof transformFunctionsPropTypeUtil.schema>;
type TransformFunctionsItemPropValue = z.infer<typeof filterTypes>;

declare const moveTransformPropTypeUtil: {
	extract: (prop: unknown) => {
		x?: any;
		y?: any;
		z?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
		{
			x?: any;
			y?: any;
			z?: any;
		}
	>;
	create: {
		(value: { x?: any; y?: any; z?: any }): TransformablePropValue$1<
			'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
			{
				x?: any;
				y?: any;
				z?: any;
			}
		>;
		(
			value: {
				x?: any;
				y?: any;
				z?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
			{
				x?: any;
				y?: any;
				z?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							x?: any;
							y?: any;
							z?: any;
					  }
					| undefined
			) => {
				x?: any;
				y?: any;
				z?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
			{
				x?: any;
				y?: any;
				z?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew'>;
			value: z.ZodType<
				{
					x?: any;
					y?: any;
					z?: any;
				},
				z.ZodTypeDef,
				{
					x?: any;
					y?: any;
					z?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
			value: {
				x?: any;
				y?: any;
				z?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
			value: {
				x?: any;
				y?: any;
				z?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
};
type MoveTransformPropValue = z.infer<typeof moveTransformPropTypeUtil.schema>;

declare const scaleTransformPropTypeUtil: {
	extract: (prop: unknown) => {
		x: {
			$$type: 'number';
			value: number | null;
			disabled?: boolean | undefined;
		} | null;
		y: {
			$$type: 'number';
			value: number | null;
			disabled?: boolean | undefined;
		} | null;
		z: {
			$$type: 'number';
			value: number | null;
			disabled?: boolean | undefined;
		} | null;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
		{
			x: {
				$$type: 'number';
				value: number | null;
				disabled?: boolean | undefined;
			} | null;
			y: {
				$$type: 'number';
				value: number | null;
				disabled?: boolean | undefined;
			} | null;
			z: {
				$$type: 'number';
				value: number | null;
				disabled?: boolean | undefined;
			} | null;
		}
	>;
	create: {
		(value: {
			x: {
				$$type: 'number';
				value: number | null;
				disabled?: boolean | undefined;
			} | null;
			y: {
				$$type: 'number';
				value: number | null;
				disabled?: boolean | undefined;
			} | null;
			z: {
				$$type: 'number';
				value: number | null;
				disabled?: boolean | undefined;
			} | null;
		}): TransformablePropValue$1<
			'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
			{
				x: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				y: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				z: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
			}
		>;
		(
			value: {
				x: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				y: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				z: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
			{
				x: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				y: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				z: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
			}
		>;
		(
			value: (
				prev?:
					| {
							x: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							y: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
							z: {
								$$type: 'number';
								value: number | null;
								disabled?: boolean | undefined;
							} | null;
					  }
					| undefined
			) => {
				x: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				y: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				z: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
			{
				x: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				y: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				z: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew'>;
			value: z.ZodType<
				{
					x: {
						$$type: 'number';
						value: number | null;
						disabled?: boolean | undefined;
					} | null;
					y: {
						$$type: 'number';
						value: number | null;
						disabled?: boolean | undefined;
					} | null;
					z: {
						$$type: 'number';
						value: number | null;
						disabled?: boolean | undefined;
					} | null;
				},
				z.ZodTypeDef,
				{
					x: {
						$$type: 'number';
						value: number | null;
						disabled?: boolean | undefined;
					} | null;
					y: {
						$$type: 'number';
						value: number | null;
						disabled?: boolean | undefined;
					} | null;
					z: {
						$$type: 'number';
						value: number | null;
						disabled?: boolean | undefined;
					} | null;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
			value: {
				x: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				y: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				z: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
			value: {
				x: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				y: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
				z: {
					$$type: 'number';
					value: number | null;
					disabled?: boolean | undefined;
				} | null;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
};
type ScaleTransformPropValue = z.infer<typeof scaleTransformPropTypeUtil.schema>;

declare const rotateTransformPropTypeUtil: {
	extract: (prop: unknown) => {
		x?: any;
		y?: any;
		z?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
		{
			x?: any;
			y?: any;
			z?: any;
		}
	>;
	create: {
		(value: { x?: any; y?: any; z?: any }): TransformablePropValue$1<
			'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
			{
				x?: any;
				y?: any;
				z?: any;
			}
		>;
		(
			value: {
				x?: any;
				y?: any;
				z?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
			{
				x?: any;
				y?: any;
				z?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							x?: any;
							y?: any;
							z?: any;
					  }
					| undefined
			) => {
				x?: any;
				y?: any;
				z?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
			{
				x?: any;
				y?: any;
				z?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew'>;
			value: z.ZodType<
				{
					x?: any;
					y?: any;
					z?: any;
				},
				z.ZodTypeDef,
				{
					x?: any;
					y?: any;
					z?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
			value: {
				x?: any;
				y?: any;
				z?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
			value: {
				x?: any;
				y?: any;
				z?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
};
type RotateTransformPropValue = z.infer<typeof rotateTransformPropTypeUtil.schema>;

declare const skewTransformPropTypeUtil: {
	extract: (prop: unknown) => {
		x?: any;
		y?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
		{
			x?: any;
			y?: any;
		}
	>;
	create: {
		(value: { x?: any; y?: any }): TransformablePropValue$1<
			'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
			{
				x?: any;
				y?: any;
			}
		>;
		(
			value: {
				x?: any;
				y?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
			{
				x?: any;
				y?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							x?: any;
							y?: any;
					  }
					| undefined
			) => {
				x?: any;
				y?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew',
			{
				x?: any;
				y?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew'>;
			value: z.ZodType<
				{
					x?: any;
					y?: any;
				},
				z.ZodTypeDef,
				{
					x?: any;
					y?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
			value: {
				x?: any;
				y?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
			value: {
				x?: any;
				y?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'transform-move' | 'transform-scale' | 'transform-rotate' | 'transform-skew';
};
type SkewTransformPropValue = z.infer<typeof skewTransformPropTypeUtil.schema>;

declare const transformOriginPropTypeUtil: {
	extract: (prop: unknown) => {
		x?: any;
		y?: any;
		z?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'transform-origin',
		{
			x?: any;
			y?: any;
			z?: any;
		}
	>;
	create: {
		(value: { x?: any; y?: any; z?: any }): TransformablePropValue$1<
			'transform-origin',
			{
				x?: any;
				y?: any;
				z?: any;
			}
		>;
		(
			value: {
				x?: any;
				y?: any;
				z?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'transform-origin',
			{
				x?: any;
				y?: any;
				z?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							x?: any;
							y?: any;
							z?: any;
					  }
					| undefined
			) => {
				x?: any;
				y?: any;
				z?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'transform-origin',
			{
				x?: any;
				y?: any;
				z?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'transform-origin'>;
			value: z.ZodType<
				{
					x?: any;
					y?: any;
					z?: any;
				},
				z.ZodTypeDef,
				{
					x?: any;
					y?: any;
					z?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'transform-origin';
			value: {
				x?: any;
				y?: any;
				z?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'transform-origin';
			value: {
				x?: any;
				y?: any;
				z?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'transform-origin';
};
type TransformOriginPropValue = z.infer<typeof transformOriginPropTypeUtil.schema>;

declare const perspectiveOriginPropTypeUtil: {
	extract: (prop: unknown) => {
		x?: any;
		y?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'perspective-origin',
		{
			x?: any;
			y?: any;
		}
	>;
	create: {
		(value: { x?: any; y?: any }): TransformablePropValue$1<
			'perspective-origin',
			{
				x?: any;
				y?: any;
			}
		>;
		(
			value: {
				x?: any;
				y?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'perspective-origin',
			{
				x?: any;
				y?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							x?: any;
							y?: any;
					  }
					| undefined
			) => {
				x?: any;
				y?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'perspective-origin',
			{
				x?: any;
				y?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'perspective-origin'>;
			value: z.ZodType<
				{
					x?: any;
					y?: any;
				},
				z.ZodTypeDef,
				{
					x?: any;
					y?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'perspective-origin';
			value: {
				x?: any;
				y?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'perspective-origin';
			value: {
				x?: any;
				y?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'perspective-origin';
};
type PerspectiveOriginPropValue = z.infer<typeof perspectiveOriginPropTypeUtil.schema>;

declare const backdropFilterPropTypeUtil: {
	extract: (prop: unknown) =>
		| {
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
		  }[]
		| null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'backdrop-filter',
		{
			$$type: 'css-filter-func';
			value: {
				func: {
					$$type: 'string';
					value: string | null;
					disabled?: boolean | undefined;
				};
				args:
					| {
							$$type: 'drop-shadow';
							value: {
								blur?: any;
								color?: any;
								xAxis?: any;
								yAxis?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'blur';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'color-tone';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'hue-rotate';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  }
					| {
							$$type: 'intensity';
							value: {
								size?: any;
							};
							disabled?: boolean | undefined;
					  };
			};
			disabled?: boolean | undefined;
		}[]
	>;
	create: {
		(
			value: {
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[]
		): TransformablePropValue$1<
			'backdrop-filter',
			{
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[]
		>;
		(
			value: {
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[],
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'backdrop-filter',
			{
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[]
		>;
		(
			value: (
				prev?:
					| {
							$$type: 'css-filter-func';
							value: {
								func: {
									$$type: 'string';
									value: string | null;
									disabled?: boolean | undefined;
								};
								args:
									| {
											$$type: 'drop-shadow';
											value: {
												blur?: any;
												color?: any;
												xAxis?: any;
												yAxis?: any;
											};
											disabled?: boolean | undefined;
									  }
									| {
											$$type: 'blur';
											value: {
												size?: any;
											};
											disabled?: boolean | undefined;
									  }
									| {
											$$type: 'color-tone';
											value: {
												size?: any;
											};
											disabled?: boolean | undefined;
									  }
									| {
											$$type: 'hue-rotate';
											value: {
												size?: any;
											};
											disabled?: boolean | undefined;
									  }
									| {
											$$type: 'intensity';
											value: {
												size?: any;
											};
											disabled?: boolean | undefined;
									  };
							};
							disabled?: boolean | undefined;
					  }[]
					| undefined
			) => {
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[],
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'backdrop-filter',
			{
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[]
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'backdrop-filter'>;
			value: z.ZodType<
				{
					$$type: 'css-filter-func';
					value: {
						func: {
							$$type: 'string';
							value: string | null;
							disabled?: boolean | undefined;
						};
						args:
							| {
									$$type: 'drop-shadow';
									value: {
										blur?: any;
										color?: any;
										xAxis?: any;
										yAxis?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'blur';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'color-tone';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'hue-rotate';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'intensity';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  };
					};
					disabled?: boolean | undefined;
				}[],
				z.ZodTypeDef,
				{
					$$type: 'css-filter-func';
					value: {
						func: {
							$$type: 'string';
							value: string | null;
							disabled?: boolean | undefined;
						};
						args:
							| {
									$$type: 'drop-shadow';
									value: {
										blur?: any;
										color?: any;
										xAxis?: any;
										yAxis?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'blur';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'color-tone';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'hue-rotate';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  }
							| {
									$$type: 'intensity';
									value: {
										size?: any;
									};
									disabled?: boolean | undefined;
							  };
					};
					disabled?: boolean | undefined;
				}[]
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'backdrop-filter';
			value: {
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[];
			disabled?: boolean | undefined;
		},
		{
			$$type: 'backdrop-filter';
			value: {
				$$type: 'css-filter-func';
				value: {
					func: {
						$$type: 'string';
						value: string | null;
						disabled?: boolean | undefined;
					};
					args:
						| {
								$$type: 'drop-shadow';
								value: {
									blur?: any;
									color?: any;
									xAxis?: any;
									yAxis?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'blur';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'color-tone';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'hue-rotate';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  }
						| {
								$$type: 'intensity';
								value: {
									size?: any;
								};
								disabled?: boolean | undefined;
						  };
				};
				disabled?: boolean | undefined;
			}[];
			disabled?: boolean | undefined;
		}
	>;
	key: 'backdrop-filter';
};
type BackdropFilterPropValue = z.infer<typeof backdropFilterPropTypeUtil.schema>;
type BackdropFilterItemPropValue = z.infer<typeof cssFilterFunctionPropUtil.schema>;

declare const dropShadowFilterPropTypeUtil: {
	extract: (prop: unknown) => {
		blur?: any;
		color?: any;
		xAxis?: any;
		yAxis?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'drop-shadow',
		{
			blur?: any;
			color?: any;
			xAxis?: any;
			yAxis?: any;
		}
	>;
	create: {
		(value: { blur?: any; color?: any; xAxis?: any; yAxis?: any }): TransformablePropValue$1<
			'drop-shadow',
			{
				blur?: any;
				color?: any;
				xAxis?: any;
				yAxis?: any;
			}
		>;
		(
			value: {
				blur?: any;
				color?: any;
				xAxis?: any;
				yAxis?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'drop-shadow',
			{
				blur?: any;
				color?: any;
				xAxis?: any;
				yAxis?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							blur?: any;
							color?: any;
							xAxis?: any;
							yAxis?: any;
					  }
					| undefined
			) => {
				blur?: any;
				color?: any;
				xAxis?: any;
				yAxis?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'drop-shadow',
			{
				blur?: any;
				color?: any;
				xAxis?: any;
				yAxis?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'drop-shadow'>;
			value: z.ZodType<
				{
					blur?: any;
					color?: any;
					xAxis?: any;
					yAxis?: any;
				},
				z.ZodTypeDef,
				{
					blur?: any;
					color?: any;
					xAxis?: any;
					yAxis?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'drop-shadow';
			value: {
				blur?: any;
				color?: any;
				xAxis?: any;
				yAxis?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'drop-shadow';
			value: {
				blur?: any;
				color?: any;
				xAxis?: any;
				yAxis?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'drop-shadow';
};
type DropShadowFilterPropValue = z.infer<typeof dropShadowFilterPropTypeUtil.schema>;

declare const blurFilterPropTypeUtil: {
	extract: (prop: unknown) => {
		size?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'blur',
		{
			size?: any;
		}
	>;
	create: {
		(value: { size?: any }): TransformablePropValue$1<
			'blur',
			{
				size?: any;
			}
		>;
		(
			value: {
				size?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'blur',
			{
				size?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							size?: any;
					  }
					| undefined
			) => {
				size?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'blur',
			{
				size?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'blur'>;
			value: z.ZodType<
				{
					size?: any;
				},
				z.ZodTypeDef,
				{
					size?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'blur';
			value: {
				size?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'blur';
			value: {
				size?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'blur';
};

declare const intensityFilterPropTypeUtil: {
	extract: (prop: unknown) => {
		size?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'intensity',
		{
			size?: any;
		}
	>;
	create: {
		(value: { size?: any }): TransformablePropValue$1<
			'intensity',
			{
				size?: any;
			}
		>;
		(
			value: {
				size?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'intensity',
			{
				size?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							size?: any;
					  }
					| undefined
			) => {
				size?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'intensity',
			{
				size?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'intensity'>;
			value: z.ZodType<
				{
					size?: any;
				},
				z.ZodTypeDef,
				{
					size?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'intensity';
			value: {
				size?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'intensity';
			value: {
				size?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'intensity';
};

declare const colorToneFilterPropTypeUtil: {
	extract: (prop: unknown) => {
		size?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'color-tone',
		{
			size?: any;
		}
	>;
	create: {
		(value: { size?: any }): TransformablePropValue$1<
			'color-tone',
			{
				size?: any;
			}
		>;
		(
			value: {
				size?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'color-tone',
			{
				size?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							size?: any;
					  }
					| undefined
			) => {
				size?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'color-tone',
			{
				size?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'color-tone'>;
			value: z.ZodType<
				{
					size?: any;
				},
				z.ZodTypeDef,
				{
					size?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'color-tone';
			value: {
				size?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'color-tone';
			value: {
				size?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'color-tone';
};

declare const hueRotateFilterPropTypeUtil: {
	extract: (prop: unknown) => {
		size?: any;
	} | null;
	isValid: (prop: unknown) => prop is TransformablePropValue$1<
		'hue-rotate',
		{
			size?: any;
		}
	>;
	create: {
		(value: { size?: any }): TransformablePropValue$1<
			'hue-rotate',
			{
				size?: any;
			}
		>;
		(
			value: {
				size?: any;
			},
			createOptions?: CreateOptions
		): TransformablePropValue$1<
			'hue-rotate',
			{
				size?: any;
			}
		>;
		(
			value: (
				prev?:
					| {
							size?: any;
					  }
					| undefined
			) => {
				size?: any;
			},
			createOptions: CreateOptions
		): TransformablePropValue$1<
			'hue-rotate',
			{
				size?: any;
			}
		>;
	};
	schema: z.ZodObject<
		{
			$$type: z.ZodLiteral<'hue-rotate'>;
			value: z.ZodType<
				{
					size?: any;
				},
				z.ZodTypeDef,
				{
					size?: any;
				}
			>;
			disabled: z.ZodOptional<z.ZodBoolean>;
		},
		'strict',
		z.ZodTypeAny,
		{
			$$type: 'hue-rotate';
			value: {
				size?: any;
			};
			disabled?: boolean | undefined;
		},
		{
			$$type: 'hue-rotate';
			value: {
				size?: any;
			};
			disabled?: boolean | undefined;
		}
	>;
	key: 'hue-rotate';
};

declare const filterEmptyValues: <TValue extends PropValue>(value: TValue) => TValue | null;
type Nullish = null | undefined | '';
declare const isEmpty: (value: PropValue) => value is Nullish;

declare const transformableSchema: z.ZodObject<
	{
		$$type: z.ZodString;
		value: z.ZodAny;
		disabled: z.ZodOptional<z.ZodBoolean>;
	},
	'strip',
	z.ZodTypeAny,
	{
		$$type: string;
		value?: any;
		disabled?: boolean | undefined;
	},
	{
		$$type: string;
		value?: any;
		disabled?: boolean | undefined;
	}
>;
type TransformablePropValue = z.infer<typeof transformableSchema>;
declare const isTransformable: (value: unknown) => value is TransformablePropValue;

declare function mergeProps(current: Props, updates: Props): Props;

declare function isDependencyMet(
	dependency: Dependency | undefined,
	values: PropValue
):
	| {
			isMet: true;
	  }
	| {
			isMet: false;
			failingDependencies: (DependencyTerm | Dependency)[];
	  };
declare function evaluateTerm(term: DependencyTerm, actualValue: unknown): boolean;
declare function extractValue(
	path: string[],
	elementValues: PropValue,
	nestedPath?: string[]
): TransformablePropValue$1<PropKey> | null;
declare function isDependency(term: DependencyTerm | Dependency): term is Dependency;

interface ParseResult {
	content: string;
	children: ChildElement[];
}
declare function parseHtmlChildren(html: string): ParseResult;

declare const Schema: {
	jsonSchemaToPropType: typeof jsonSchemaToPropType;
	propTypeToJsonSchema: typeof propTypeToJsonSchema;
	adjustLlmPropValueSchema: (
		value: Readonly<PropValue>,
		{
			transformers,
			forceKey,
		}?: {
			forceKey?: string;
			transformers?: Record<string, (value: unknown) => PropValue>;
		}
	) => PropValue;
	isPropKeyConfigurable: typeof isPropKeyConfigurable;
	nonConfigurablePropKeys: readonly string[];
	configurableKeys: typeof configurableKeys;
	validatePropValue: (
		schema: PropType,
		value: unknown
	) =>
		| {
				valid: boolean;
				errors: never[];
				errorMessages: never[];
				jsonSchema: string;
		  }
		| {
				valid: boolean;
				errors: jsonschema.ValidationError[];
				errorMessages: string;
				jsonSchema: string;
		  };
	enrichWithIntention: typeof enrichWithIntention;
	removeIntention: typeof removeIntention;
};

export {
	type AnyTransformable,
	type ArrayPropType,
	type ArrayPropValue,
	type BackdropFilterItemPropValue,
	type BackdropFilterPropValue,
	type BackgroundColorOverlayPropValue,
	type BackgroundGradientOverlayPropValue,
	type BackgroundImageOverlayPropValue,
	type BackgroundImagePositionOffsetPropValue,
	type BackgroundImageSizeScalePropValue,
	type BackgroundOverlayImagePropType,
	type BackgroundOverlayItemPropValue,
	type BackgroundOverlayPropType,
	type BackgroundOverlayPropValue,
	type BackgroundPropValue,
	type BooleanPropValue,
	type BorderRadiusPropValue,
	type BorderWidthPropValue,
	type BoxShadowPropValue,
	CLASSES_PROP_KEY,
	type ChildElement,
	type ClassesPropValue,
	type ColorPropValue,
	type ColorStopPropValue,
	type CreateOptions,
	DateTimePropTypeUtil,
	type DateTimePropValue,
	type Dependency,
	type DependencyOperator,
	type DependencyTerm,
	type DimensionsPropValue,
	type DropShadowFilterPropValue,
	type EmailPropValue,
	type FilterItemPropValue,
	type FilterPropValue,
	type FlexPropValue,
	type GradientColorStopPropValue,
	type HtmlPropValue,
	type HtmlV2PropValue,
	type HtmlV2Value,
	type HtmlV3PropValue,
	type HtmlV3Value,
	type ImageAttachmentIdPropValue,
	type ImagePropValue,
	type ImageSrcPropValue,
	type JsonSchema7,
	type KeyValuePropValue,
	type LayoutDirectionPropValue,
	type LinkPropValue,
	type MoveTransformPropValue,
	type NumberPropValue,
	type ObjectPropType,
	type ObjectPropValue,
	type ParseResult,
	type PerspectiveOriginPropValue,
	type PlainPropType,
	type PlainPropValue,
	type PositionPropTypeValue,
	type PropKey,
	type PropType,
	type PropTypeKey,
	type PropTypeUtil,
	type PropValue,
	type Props,
	type PropsSchema,
	type QueryPropValue,
	type RotateTransformPropValue,
	type ScaleTransformPropValue,
	Schema,
	type SelectionSizePropValue,
	type ShadowPropValue,
	type SizePropValue,
	type SkewTransformPropValue,
	type StringArrayPropValue,
	type StringPropValue,
	type StrokePropValue,
	type TransformFunctionsItemPropValue,
	type TransformFunctionsPropValue,
	type TransformOriginPropValue,
	type TransformPropValue,
	type TransformablePropType,
	type TransformablePropValue$1 as TransformablePropValue,
	type UnionPropType,
	type UrlPropValue,
	type VideoAttachmentIdPropValue,
	type VideoSrcPropValue,
	backdropFilterPropTypeUtil,
	backgroundColorOverlayPropTypeUtil,
	backgroundGradientOverlayPropTypeUtil,
	backgroundImageOverlayPropTypeUtil,
	backgroundImagePositionOffsetPropTypeUtil,
	backgroundImageSizeScalePropTypeUtil,
	backgroundOverlayItem,
	backgroundOverlayPropTypeUtil,
	backgroundPropTypeUtil,
	blurFilterPropTypeUtil,
	booleanPropTypeUtil,
	borderRadiusPropTypeUtil,
	borderWidthPropTypeUtil,
	boxShadowPropTypeUtil,
	classesPropTypeUtil,
	colorPropTypeUtil,
	colorStopPropTypeUtil,
	colorToneFilterPropTypeUtil,
	createArrayPropUtils,
	createPropUtils,
	cssFilterFunctionPropUtil,
	dimensionsPropTypeUtil,
	dropShadowFilterPropTypeUtil,
	emailPropTypeUtil,
	evaluateTerm,
	extractValue,
	filterEmptyValues,
	filterPropTypeUtil,
	flexPropTypeUtil,
	getPropSchemaFromCache,
	gradientColorStopPropTypeUtil,
	htmlPropTypeUtil,
	htmlV2PropTypeUtil,
	htmlV3PropTypeUtil,
	hueRotateFilterPropTypeUtil,
	imageAttachmentIdPropType,
	imagePropTypeUtil,
	imageSrcPropTypeUtil,
	intensityFilterPropTypeUtil,
	isDependency,
	isDependencyMet,
	isEmpty,
	isTransformable,
	keyValuePropTypeUtil,
	layoutDirectionPropTypeUtil,
	linkPropTypeUtil,
	mergeProps,
	moveTransformPropTypeUtil,
	numberPropTypeUtil,
	parseHtmlChildren,
	perspectiveOriginPropTypeUtil,
	positionPropTypeUtil,
	queryPropTypeUtil,
	rotateTransformPropTypeUtil,
	scaleTransformPropTypeUtil,
	selectionSizePropTypeUtil,
	shadowPropTypeUtil,
	sizePropTypeUtil,
	skewTransformPropTypeUtil,
	stringArrayPropTypeUtil,
	stringPropTypeUtil,
	strokePropTypeUtil,
	transformFunctionsPropTypeUtil,
	transformOriginPropTypeUtil,
	transformPropTypeUtil,
	urlPropTypeUtil,
	videoAttachmentIdPropType,
	videoSrcPropTypeUtil,
};
