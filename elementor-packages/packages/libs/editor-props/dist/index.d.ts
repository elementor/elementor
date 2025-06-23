import { ZodType, z } from '@elementor/schema';

type PropTypeKey = string;
type DependencyEffect = 'disable' | 'hide';
type DependencyOperator = 'lt' | 'lte' | 'eq' | 'ne' | 'gte' | 'gt' | 'exists' | 'not_exist' | 'in' | 'nin' | 'contains' | 'ncontains';
type DependencyTerm = {
    operator: DependencyOperator;
    path: string[];
    value: PropValue;
};
type Dependency = {
    effect: DependencyEffect;
    relation: 'or' | 'and';
    terms: (DependencyTerm | Dependency)[];
};
type BasePropType<TValue> = {
    default?: TValue | null;
    settings: Record<string, unknown>;
    meta: Record<string, unknown>;
    dependencies?: Dependency[];
};
type PlainPropType = BasePropType<PlainPropValue> & {
    kind: 'plain';
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
        src: TransformablePropValue$1<'dynamic', {
            name: string;
            settings?: Record<string, unknown>;
        }>;
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
type PropType = TransformablePropType | UnionPropType;
type PropsSchema = Record<string, PropType>;
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
 */
declare function createPropUtils<TKey extends string, TValue extends PropValue>(key: TKey, valueSchema: ZodType<TValue>): {
    extract: (prop: unknown) => TValue | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<TKey, TValue>;
    create: {
        (value: TValue): TransformablePropValue$1<TKey, TValue>;
        (value: TValue, createOptions?: CreateOptions): TransformablePropValue$1<TKey, TValue>;
        (value: Updater<TValue>, createOptions: CreateOptions): TransformablePropValue$1<TKey, TValue>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<TKey>;
        value: z.ZodType<TValue, z.ZodTypeDef, TValue>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        $$type: z.ZodLiteral<TKey>;
        value: z.ZodType<TValue, z.ZodTypeDef, TValue>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }>, any> extends infer T ? { [k in keyof T]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        $$type: z.ZodLiteral<TKey>;
        value: z.ZodType<TValue, z.ZodTypeDef, TValue>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }>, any>[k]; } : never, z.baseObjectInputType<{
        $$type: z.ZodLiteral<TKey>;
        value: z.ZodType<TValue, z.ZodTypeDef, TValue>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }> extends infer T_1 ? { [k_1 in keyof T_1]: z.baseObjectInputType<{
        $$type: z.ZodLiteral<TKey>;
        value: z.ZodType<TValue, z.ZodTypeDef, TValue>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }>[k_1]; } : never>;
    key: TKey;
};
declare function createArrayPropUtils<TKey extends string, TValue extends PropValue>(key: TKey, valueSchema: ZodType<TValue>): {
    extract: (prop: unknown) => TValue[] | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<`${TKey}-array`, TValue[]>;
    create: {
        (value: TValue[]): TransformablePropValue$1<`${TKey}-array`, TValue[]>;
        (value: TValue[], createOptions?: CreateOptions): TransformablePropValue$1<`${TKey}-array`, TValue[]>;
        (value: Updater<TValue[]>, createOptions: CreateOptions): TransformablePropValue$1<`${TKey}-array`, TValue[]>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<`${TKey}-array`>;
        value: z.ZodType<TValue[], z.ZodTypeDef, TValue[]>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        $$type: z.ZodLiteral<`${TKey}-array`>;
        value: z.ZodType<TValue[], z.ZodTypeDef, TValue[]>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }>, any> extends infer T ? { [k in keyof T]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        $$type: z.ZodLiteral<`${TKey}-array`>;
        value: z.ZodType<TValue[], z.ZodTypeDef, TValue[]>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }>, any>[k]; } : never, z.baseObjectInputType<{
        $$type: z.ZodLiteral<`${TKey}-array`>;
        value: z.ZodType<TValue[], z.ZodTypeDef, TValue[]>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }> extends infer T_1 ? { [k_1 in keyof T_1]: z.baseObjectInputType<{
        $$type: z.ZodLiteral<`${TKey}-array`>;
        value: z.ZodType<TValue[], z.ZodTypeDef, TValue[]>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }>[k_1]; } : never>;
    key: `${TKey}-array`;
};

declare const boxShadowPropTypeUtil: {
    extract: (prop: unknown) => {
        $$type: "shadow";
        value: {
            position?: any;
            hOffset?: any;
            vOffset?: any;
            blur?: any;
            spread?: any;
            color?: any;
        };
        disabled?: boolean | undefined;
    }[] | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"box-shadow", {
        $$type: "shadow";
        value: {
            position?: any;
            hOffset?: any;
            vOffset?: any;
            blur?: any;
            spread?: any;
            color?: any;
        };
        disabled?: boolean | undefined;
    }[]>;
    create: {
        (value: {
            $$type: "shadow";
            value: {
                position?: any;
                hOffset?: any;
                vOffset?: any;
                blur?: any;
                spread?: any;
                color?: any;
            };
            disabled?: boolean | undefined;
        }[]): TransformablePropValue$1<"box-shadow", {
            $$type: "shadow";
            value: {
                position?: any;
                hOffset?: any;
                vOffset?: any;
                blur?: any;
                spread?: any;
                color?: any;
            };
            disabled?: boolean | undefined;
        }[]>;
        (value: {
            $$type: "shadow";
            value: {
                position?: any;
                hOffset?: any;
                vOffset?: any;
                blur?: any;
                spread?: any;
                color?: any;
            };
            disabled?: boolean | undefined;
        }[], createOptions?: CreateOptions): TransformablePropValue$1<"box-shadow", {
            $$type: "shadow";
            value: {
                position?: any;
                hOffset?: any;
                vOffset?: any;
                blur?: any;
                spread?: any;
                color?: any;
            };
            disabled?: boolean | undefined;
        }[]>;
        (value: (prev?: {
            $$type: "shadow";
            value: {
                position?: any;
                hOffset?: any;
                vOffset?: any;
                blur?: any;
                spread?: any;
                color?: any;
            };
            disabled?: boolean | undefined;
        }[] | undefined) => {
            $$type: "shadow";
            value: {
                position?: any;
                hOffset?: any;
                vOffset?: any;
                blur?: any;
                spread?: any;
                color?: any;
            };
            disabled?: boolean | undefined;
        }[], createOptions: CreateOptions): TransformablePropValue$1<"box-shadow", {
            $$type: "shadow";
            value: {
                position?: any;
                hOffset?: any;
                vOffset?: any;
                blur?: any;
                spread?: any;
                color?: any;
            };
            disabled?: boolean | undefined;
        }[]>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"box-shadow">;
        value: z.ZodType<{
            $$type: "shadow";
            value: {
                position?: any;
                hOffset?: any;
                vOffset?: any;
                blur?: any;
                spread?: any;
                color?: any;
            };
            disabled?: boolean | undefined;
        }[], z.ZodTypeDef, {
            $$type: "shadow";
            value: {
                position?: any;
                hOffset?: any;
                vOffset?: any;
                blur?: any;
                spread?: any;
                color?: any;
            };
            disabled?: boolean | undefined;
        }[]>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "box-shadow";
        value: {
            $$type: "shadow";
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
    }, {
        $$type: "box-shadow";
        value: {
            $$type: "shadow";
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
    }>;
    key: "box-shadow";
};
type BoxShadowPropValue = z.infer<typeof boxShadowPropTypeUtil.schema>;

declare const borderRadiusPropTypeUtil: {
    extract: (prop: unknown) => {
        'start-start'?: any;
        'start-end'?: any;
        'end-start'?: any;
        'end-end'?: any;
    } | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"border-radius", {
        'start-start'?: any;
        'start-end'?: any;
        'end-start'?: any;
        'end-end'?: any;
    }>;
    create: {
        (value: {
            'start-start'?: any;
            'start-end'?: any;
            'end-start'?: any;
            'end-end'?: any;
        }): TransformablePropValue$1<"border-radius", {
            'start-start'?: any;
            'start-end'?: any;
            'end-start'?: any;
            'end-end'?: any;
        }>;
        (value: {
            'start-start'?: any;
            'start-end'?: any;
            'end-start'?: any;
            'end-end'?: any;
        }, createOptions?: CreateOptions): TransformablePropValue$1<"border-radius", {
            'start-start'?: any;
            'start-end'?: any;
            'end-start'?: any;
            'end-end'?: any;
        }>;
        (value: (prev?: {
            'start-start'?: any;
            'start-end'?: any;
            'end-start'?: any;
            'end-end'?: any;
        } | undefined) => {
            'start-start'?: any;
            'start-end'?: any;
            'end-start'?: any;
            'end-end'?: any;
        }, createOptions: CreateOptions): TransformablePropValue$1<"border-radius", {
            'start-start'?: any;
            'start-end'?: any;
            'end-start'?: any;
            'end-end'?: any;
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"border-radius">;
        value: z.ZodType<{
            'start-start'?: any;
            'start-end'?: any;
            'end-start'?: any;
            'end-end'?: any;
        }, z.ZodTypeDef, {
            'start-start'?: any;
            'start-end'?: any;
            'end-start'?: any;
            'end-end'?: any;
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "border-radius";
        value: {
            'start-start'?: any;
            'start-end'?: any;
            'end-start'?: any;
            'end-end'?: any;
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "border-radius";
        value: {
            'start-start'?: any;
            'start-end'?: any;
            'end-start'?: any;
            'end-end'?: any;
        };
        disabled?: boolean | undefined;
    }>;
    key: "border-radius";
};
type BorderRadiusPropValue = z.infer<typeof borderRadiusPropTypeUtil.schema>;

declare const borderWidthPropTypeUtil: {
    extract: (prop: unknown) => {
        'block-start'?: any;
        'block-end'?: any;
        'inline-start'?: any;
        'inline-end'?: any;
    } | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"border-width", {
        'block-start'?: any;
        'block-end'?: any;
        'inline-start'?: any;
        'inline-end'?: any;
    }>;
    create: {
        (value: {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }): TransformablePropValue$1<"border-width", {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }>;
        (value: {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }, createOptions?: CreateOptions): TransformablePropValue$1<"border-width", {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }>;
        (value: (prev?: {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        } | undefined) => {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }, createOptions: CreateOptions): TransformablePropValue$1<"border-width", {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"border-width">;
        value: z.ZodType<{
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }, z.ZodTypeDef, {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "border-width";
        value: {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "border-width";
        value: {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        };
        disabled?: boolean | undefined;
    }>;
    key: "border-width";
};
type BorderWidthPropValue = z.infer<typeof borderWidthPropTypeUtil.schema>;

declare const CLASSES_PROP_KEY = "classes";
declare const classesPropTypeUtil: {
    extract: (prop: unknown) => string[] | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"classes", string[]>;
    create: {
        (value: string[]): TransformablePropValue$1<"classes", string[]>;
        (value: string[], createOptions?: CreateOptions): TransformablePropValue$1<"classes", string[]>;
        (value: (prev?: string[] | undefined) => string[], createOptions: CreateOptions): TransformablePropValue$1<"classes", string[]>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"classes">;
        value: z.ZodType<string[], z.ZodTypeDef, string[]>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "classes";
        value: string[];
        disabled?: boolean | undefined;
    }, {
        $$type: "classes";
        value: string[];
        disabled?: boolean | undefined;
    }>;
    key: "classes";
};
type ClassesPropValue = z.infer<typeof classesPropTypeUtil.schema>;

declare const colorPropTypeUtil: {
    extract: (prop: unknown) => string | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"color", string>;
    create: {
        (value: string): TransformablePropValue$1<"color", string>;
        (value: string, createOptions?: CreateOptions): TransformablePropValue$1<"color", string>;
        (value: (prev?: string | undefined) => string, createOptions: CreateOptions): TransformablePropValue$1<"color", string>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"color">;
        value: z.ZodType<string, z.ZodTypeDef, string>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "color";
        value: string;
        disabled?: boolean | undefined;
    }, {
        $$type: "color";
        value: string;
        disabled?: boolean | undefined;
    }>;
    key: "color";
};
type ColorPropValue = z.infer<typeof colorPropTypeUtil.schema>;

declare const imagePropTypeUtil: {
    extract: (prop: unknown) => {
        size?: any;
        src?: any;
    } | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"image", {
        size?: any;
        src?: any;
    }>;
    create: {
        (value: {
            size?: any;
            src?: any;
        }): TransformablePropValue$1<"image", {
            size?: any;
            src?: any;
        }>;
        (value: {
            size?: any;
            src?: any;
        }, createOptions?: CreateOptions): TransformablePropValue$1<"image", {
            size?: any;
            src?: any;
        }>;
        (value: (prev?: {
            size?: any;
            src?: any;
        } | undefined) => {
            size?: any;
            src?: any;
        }, createOptions: CreateOptions): TransformablePropValue$1<"image", {
            size?: any;
            src?: any;
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"image">;
        value: z.ZodType<{
            size?: any;
            src?: any;
        }, z.ZodTypeDef, {
            size?: any;
            src?: any;
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "image";
        value: {
            size?: any;
            src?: any;
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "image";
        value: {
            size?: any;
            src?: any;
        };
        disabled?: boolean | undefined;
    }>;
    key: "image";
};
type ImagePropValue = z.infer<typeof imagePropTypeUtil.schema>;

declare const imageAttachmentIdPropType: {
    extract: (prop: unknown) => number | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"image-attachment-id", number>;
    create: {
        (value: number): TransformablePropValue$1<"image-attachment-id", number>;
        (value: number, createOptions?: CreateOptions): TransformablePropValue$1<"image-attachment-id", number>;
        (value: (prev?: number | undefined) => number, createOptions: CreateOptions): TransformablePropValue$1<"image-attachment-id", number>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"image-attachment-id">;
        value: z.ZodType<number, z.ZodTypeDef, number>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "image-attachment-id";
        value: number;
        disabled?: boolean | undefined;
    }, {
        $$type: "image-attachment-id";
        value: number;
        disabled?: boolean | undefined;
    }>;
    key: "image-attachment-id";
};
type ImageAttachmentIdPropValue = z.infer<typeof imageAttachmentIdPropType.schema>;

declare const imageSrcPropTypeUtil: {
    extract: (prop: unknown) => {
        url: null;
        id?: any;
    } | {
        id: null;
        url?: any;
    } | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"image-src", {
        url: null;
        id?: any;
    } | {
        id: null;
        url?: any;
    }>;
    create: {
        (value: {
            url: null;
            id?: any;
        } | {
            id: null;
            url?: any;
        }): TransformablePropValue$1<"image-src", {
            url: null;
            id?: any;
        } | {
            id: null;
            url?: any;
        }>;
        (value: {
            url: null;
            id?: any;
        } | {
            id: null;
            url?: any;
        }, createOptions?: CreateOptions): TransformablePropValue$1<"image-src", {
            url: null;
            id?: any;
        } | {
            id: null;
            url?: any;
        }>;
        (value: (prev?: {
            url: null;
            id?: any;
        } | {
            id: null;
            url?: any;
        } | undefined) => {
            url: null;
            id?: any;
        } | {
            id: null;
            url?: any;
        }, createOptions: CreateOptions): TransformablePropValue$1<"image-src", {
            url: null;
            id?: any;
        } | {
            id: null;
            url?: any;
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"image-src">;
        value: z.ZodType<{
            url: null;
            id?: any;
        } | {
            id: null;
            url?: any;
        }, z.ZodTypeDef, {
            url: null;
            id?: any;
        } | {
            id: null;
            url?: any;
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "image-src";
        value: {
            url: null;
            id?: any;
        } | {
            id: null;
            url?: any;
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "image-src";
        value: {
            url: null;
            id?: any;
        } | {
            id: null;
            url?: any;
        };
        disabled?: boolean | undefined;
    }>;
    key: "image-src";
};
type ImageSrcPropValue = z.infer<typeof imageSrcPropTypeUtil.schema>;

declare const dimensionsPropTypeUtil: {
    extract: (prop: unknown) => {
        'block-start'?: any;
        'block-end'?: any;
        'inline-start'?: any;
        'inline-end'?: any;
    } | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"dimensions", {
        'block-start'?: any;
        'block-end'?: any;
        'inline-start'?: any;
        'inline-end'?: any;
    }>;
    create: {
        (value: {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }): TransformablePropValue$1<"dimensions", {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }>;
        (value: {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }, createOptions?: CreateOptions): TransformablePropValue$1<"dimensions", {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }>;
        (value: (prev?: {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        } | undefined) => {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }, createOptions: CreateOptions): TransformablePropValue$1<"dimensions", {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"dimensions">;
        value: z.ZodType<{
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }, z.ZodTypeDef, {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "dimensions";
        value: {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "dimensions";
        value: {
            'block-start'?: any;
            'block-end'?: any;
            'inline-start'?: any;
            'inline-end'?: any;
        };
        disabled?: boolean | undefined;
    }>;
    key: "dimensions";
};
type DimensionsPropValue = z.infer<typeof dimensionsPropTypeUtil.schema>;

declare const numberPropTypeUtil: {
    extract: (prop: unknown) => number | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"number", number | null>;
    create: {
        (value: number | null): TransformablePropValue$1<"number", number | null>;
        (value: number | null, createOptions?: CreateOptions): TransformablePropValue$1<"number", number | null>;
        (value: (prev?: number | null | undefined) => number | null, createOptions: CreateOptions): TransformablePropValue$1<"number", number | null>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"number">;
        value: z.ZodType<number | null, z.ZodTypeDef, number | null>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "number";
        value: number | null;
        disabled?: boolean | undefined;
    }, {
        $$type: "number";
        value: number | null;
        disabled?: boolean | undefined;
    }>;
    key: "number";
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
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"shadow", {
        position?: any;
        hOffset?: any;
        vOffset?: any;
        blur?: any;
        spread?: any;
        color?: any;
    }>;
    create: {
        (value: {
            position?: any;
            hOffset?: any;
            vOffset?: any;
            blur?: any;
            spread?: any;
            color?: any;
        }): TransformablePropValue$1<"shadow", {
            position?: any;
            hOffset?: any;
            vOffset?: any;
            blur?: any;
            spread?: any;
            color?: any;
        }>;
        (value: {
            position?: any;
            hOffset?: any;
            vOffset?: any;
            blur?: any;
            spread?: any;
            color?: any;
        }, createOptions?: CreateOptions): TransformablePropValue$1<"shadow", {
            position?: any;
            hOffset?: any;
            vOffset?: any;
            blur?: any;
            spread?: any;
            color?: any;
        }>;
        (value: (prev?: {
            position?: any;
            hOffset?: any;
            vOffset?: any;
            blur?: any;
            spread?: any;
            color?: any;
        } | undefined) => {
            position?: any;
            hOffset?: any;
            vOffset?: any;
            blur?: any;
            spread?: any;
            color?: any;
        }, createOptions: CreateOptions): TransformablePropValue$1<"shadow", {
            position?: any;
            hOffset?: any;
            vOffset?: any;
            blur?: any;
            spread?: any;
            color?: any;
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"shadow">;
        value: z.ZodType<{
            position?: any;
            hOffset?: any;
            vOffset?: any;
            blur?: any;
            spread?: any;
            color?: any;
        }, z.ZodTypeDef, {
            position?: any;
            hOffset?: any;
            vOffset?: any;
            blur?: any;
            spread?: any;
            color?: any;
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "shadow";
        value: {
            position?: any;
            hOffset?: any;
            vOffset?: any;
            blur?: any;
            spread?: any;
            color?: any;
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "shadow";
        value: {
            position?: any;
            hOffset?: any;
            vOffset?: any;
            blur?: any;
            spread?: any;
            color?: any;
        };
        disabled?: boolean | undefined;
    }>;
    key: "shadow";
};
type ShadowPropValue = z.infer<typeof shadowPropTypeUtil.schema>;

declare const sizePropTypeUtil: {
    extract: (prop: unknown) => {
        size: number;
        unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
    } | {
        size: "";
        unit: "auto";
    } | {
        size: string;
        unit: "custom";
    } | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"size", {
        size: number;
        unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
    } | {
        size: "";
        unit: "auto";
    } | {
        size: string;
        unit: "custom";
    }>;
    create: {
        (value: {
            size: number;
            unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
        } | {
            size: "";
            unit: "auto";
        } | {
            size: string;
            unit: "custom";
        }): TransformablePropValue$1<"size", {
            size: number;
            unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
        } | {
            size: "";
            unit: "auto";
        } | {
            size: string;
            unit: "custom";
        }>;
        (value: {
            size: number;
            unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
        } | {
            size: "";
            unit: "auto";
        } | {
            size: string;
            unit: "custom";
        }, createOptions?: CreateOptions): TransformablePropValue$1<"size", {
            size: number;
            unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
        } | {
            size: "";
            unit: "auto";
        } | {
            size: string;
            unit: "custom";
        }>;
        (value: (prev?: {
            size: number;
            unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
        } | {
            size: "";
            unit: "auto";
        } | {
            size: string;
            unit: "custom";
        } | undefined) => {
            size: number;
            unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
        } | {
            size: "";
            unit: "auto";
        } | {
            size: string;
            unit: "custom";
        }, createOptions: CreateOptions): TransformablePropValue$1<"size", {
            size: number;
            unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
        } | {
            size: "";
            unit: "auto";
        } | {
            size: string;
            unit: "custom";
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"size">;
        value: z.ZodType<{
            size: number;
            unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
        } | {
            size: "";
            unit: "auto";
        } | {
            size: string;
            unit: "custom";
        }, z.ZodTypeDef, {
            size: number;
            unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
        } | {
            size: "";
            unit: "auto";
        } | {
            size: string;
            unit: "custom";
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "size";
        value: {
            size: number;
            unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
        } | {
            size: "";
            unit: "auto";
        } | {
            size: string;
            unit: "custom";
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "size";
        value: {
            size: number;
            unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
        } | {
            size: "";
            unit: "auto";
        } | {
            size: string;
            unit: "custom";
        };
        disabled?: boolean | undefined;
    }>;
    key: "size";
};
type SizePropValue = z.infer<typeof sizePropTypeUtil.schema>;

declare const stringPropTypeUtil: {
    extract: (prop: unknown) => string | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"string", string | null>;
    create: {
        (value: string | null): TransformablePropValue$1<"string", string | null>;
        (value: string | null, createOptions?: CreateOptions): TransformablePropValue$1<"string", string | null>;
        (value: (prev?: string | null | undefined) => string | null, createOptions: CreateOptions): TransformablePropValue$1<"string", string | null>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"string">;
        value: z.ZodType<string | null, z.ZodTypeDef, string | null>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "string";
        value: string | null;
        disabled?: boolean | undefined;
    }, {
        $$type: "string";
        value: string | null;
        disabled?: boolean | undefined;
    }>;
    key: "string";
};
type StringPropValue = z.infer<typeof stringPropTypeUtil.schema>;

declare const strokePropTypeUtil: {
    extract: (prop: unknown) => {
        color?: any;
        width?: any;
    } | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"stroke", {
        color?: any;
        width?: any;
    }>;
    create: {
        (value: {
            color?: any;
            width?: any;
        }): TransformablePropValue$1<"stroke", {
            color?: any;
            width?: any;
        }>;
        (value: {
            color?: any;
            width?: any;
        }, createOptions?: CreateOptions): TransformablePropValue$1<"stroke", {
            color?: any;
            width?: any;
        }>;
        (value: (prev?: {
            color?: any;
            width?: any;
        } | undefined) => {
            color?: any;
            width?: any;
        }, createOptions: CreateOptions): TransformablePropValue$1<"stroke", {
            color?: any;
            width?: any;
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"stroke">;
        value: z.ZodType<{
            color?: any;
            width?: any;
        }, z.ZodTypeDef, {
            color?: any;
            width?: any;
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "stroke";
        value: {
            color?: any;
            width?: any;
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "stroke";
        value: {
            color?: any;
            width?: any;
        };
        disabled?: boolean | undefined;
    }>;
    key: "stroke";
};
type StrokePropValue = z.infer<typeof strokePropTypeUtil.schema>;

declare const urlPropTypeUtil: {
    extract: (prop: unknown) => string | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"url", string | null>;
    create: {
        (value: string | null): TransformablePropValue$1<"url", string | null>;
        (value: string | null, createOptions?: CreateOptions): TransformablePropValue$1<"url", string | null>;
        (value: (prev?: string | null | undefined) => string | null, createOptions: CreateOptions): TransformablePropValue$1<"url", string | null>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"url">;
        value: z.ZodType<string | null, z.ZodTypeDef, string | null>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "url";
        value: string | null;
        disabled?: boolean | undefined;
    }, {
        $$type: "url";
        value: string | null;
        disabled?: boolean | undefined;
    }>;
    key: "url";
};
type UrlPropValue = z.infer<typeof urlPropTypeUtil.schema>;

declare const layoutDirectionPropTypeUtil: {
    extract: (prop: unknown) => {
        row?: any;
        column?: any;
    } | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"layout-direction", {
        row?: any;
        column?: any;
    }>;
    create: {
        (value: {
            row?: any;
            column?: any;
        }): TransformablePropValue$1<"layout-direction", {
            row?: any;
            column?: any;
        }>;
        (value: {
            row?: any;
            column?: any;
        }, createOptions?: CreateOptions): TransformablePropValue$1<"layout-direction", {
            row?: any;
            column?: any;
        }>;
        (value: (prev?: {
            row?: any;
            column?: any;
        } | undefined) => {
            row?: any;
            column?: any;
        }, createOptions: CreateOptions): TransformablePropValue$1<"layout-direction", {
            row?: any;
            column?: any;
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"layout-direction">;
        value: z.ZodType<{
            row?: any;
            column?: any;
        }, z.ZodTypeDef, {
            row?: any;
            column?: any;
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "layout-direction";
        value: {
            row?: any;
            column?: any;
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "layout-direction";
        value: {
            row?: any;
            column?: any;
        };
        disabled?: boolean | undefined;
    }>;
    key: "layout-direction";
};
type LayoutDirectionPropValue = z.infer<typeof layoutDirectionPropTypeUtil.schema>;

declare const linkPropTypeUtil: {
    extract: (prop: unknown) => {
        destination?: any;
        label?: any;
        isTargetBlank?: any;
    } | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"link", {
        destination?: any;
        label?: any;
        isTargetBlank?: any;
    }>;
    create: {
        (value: {
            destination?: any;
            label?: any;
            isTargetBlank?: any;
        }): TransformablePropValue$1<"link", {
            destination?: any;
            label?: any;
            isTargetBlank?: any;
        }>;
        (value: {
            destination?: any;
            label?: any;
            isTargetBlank?: any;
        }, createOptions?: CreateOptions): TransformablePropValue$1<"link", {
            destination?: any;
            label?: any;
            isTargetBlank?: any;
        }>;
        (value: (prev?: {
            destination?: any;
            label?: any;
            isTargetBlank?: any;
        } | undefined) => {
            destination?: any;
            label?: any;
            isTargetBlank?: any;
        }, createOptions: CreateOptions): TransformablePropValue$1<"link", {
            destination?: any;
            label?: any;
            isTargetBlank?: any;
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"link">;
        value: z.ZodType<{
            destination?: any;
            label?: any;
            isTargetBlank?: any;
        }, z.ZodTypeDef, {
            destination?: any;
            label?: any;
            isTargetBlank?: any;
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "link";
        value: {
            destination?: any;
            label?: any;
            isTargetBlank?: any;
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "link";
        value: {
            destination?: any;
            label?: any;
            isTargetBlank?: any;
        };
        disabled?: boolean | undefined;
    }>;
    key: "link";
};
type LinkPropValue = z.infer<typeof linkPropTypeUtil.schema>;

declare const backgroundPropTypeUtil: {
    extract: (prop: unknown) => {
        color?: any;
        'background-overlay'?: any;
    } | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"background", {
        color?: any;
        'background-overlay'?: any;
    }>;
    create: {
        (value: {
            color?: any;
            'background-overlay'?: any;
        }): TransformablePropValue$1<"background", {
            color?: any;
            'background-overlay'?: any;
        }>;
        (value: {
            color?: any;
            'background-overlay'?: any;
        }, createOptions?: CreateOptions): TransformablePropValue$1<"background", {
            color?: any;
            'background-overlay'?: any;
        }>;
        (value: (prev?: {
            color?: any;
            'background-overlay'?: any;
        } | undefined) => {
            color?: any;
            'background-overlay'?: any;
        }, createOptions: CreateOptions): TransformablePropValue$1<"background", {
            color?: any;
            'background-overlay'?: any;
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"background">;
        value: z.ZodType<{
            color?: any;
            'background-overlay'?: any;
        }, z.ZodTypeDef, {
            color?: any;
            'background-overlay'?: any;
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "background";
        value: {
            color?: any;
            'background-overlay'?: any;
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "background";
        value: {
            color?: any;
            'background-overlay'?: any;
        };
        disabled?: boolean | undefined;
    }>;
    key: "background";
};
type BackgroundPropValue = z.infer<typeof backgroundPropTypeUtil.schema>;

declare const backgroundOverlayItem: z.ZodUnion<[z.ZodUnion<[z.ZodObject<{
    $$type: z.ZodLiteral<"background-color-overlay">;
    value: z.ZodType<any, z.ZodTypeDef, any>;
    disabled: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    $$type: "background-color-overlay";
    value?: any;
    disabled?: boolean | undefined;
}, {
    $$type: "background-color-overlay";
    value?: any;
    disabled?: boolean | undefined;
}>, z.ZodObject<{
    $$type: z.ZodLiteral<"background-gradient-overlay">;
    value: z.ZodType<any, z.ZodTypeDef, any>;
    disabled: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    $$type: "background-gradient-overlay";
    value?: any;
    disabled?: boolean | undefined;
}, {
    $$type: "background-gradient-overlay";
    value?: any;
    disabled?: boolean | undefined;
}>]>, z.ZodObject<{
    $$type: z.ZodLiteral<"background-image-overlay">;
    value: z.ZodType<any, z.ZodTypeDef, any>;
    disabled: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    $$type: "background-image-overlay";
    value?: any;
    disabled?: boolean | undefined;
}, {
    $$type: "background-image-overlay";
    value?: any;
    disabled?: boolean | undefined;
}>]>;
declare const backgroundOverlayPropTypeUtil: {
    extract: (prop: unknown) => ({
        $$type: "background-color-overlay";
        value?: any;
        disabled?: boolean | undefined;
    } | {
        $$type: "background-gradient-overlay";
        value?: any;
        disabled?: boolean | undefined;
    } | {
        $$type: "background-image-overlay";
        value?: any;
        disabled?: boolean | undefined;
    })[] | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"background-overlay", ({
        $$type: "background-color-overlay";
        value?: any;
        disabled?: boolean | undefined;
    } | {
        $$type: "background-gradient-overlay";
        value?: any;
        disabled?: boolean | undefined;
    } | {
        $$type: "background-image-overlay";
        value?: any;
        disabled?: boolean | undefined;
    })[]>;
    create: {
        (value: ({
            $$type: "background-color-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-gradient-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-image-overlay";
            value?: any;
            disabled?: boolean | undefined;
        })[]): TransformablePropValue$1<"background-overlay", ({
            $$type: "background-color-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-gradient-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-image-overlay";
            value?: any;
            disabled?: boolean | undefined;
        })[]>;
        (value: ({
            $$type: "background-color-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-gradient-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-image-overlay";
            value?: any;
            disabled?: boolean | undefined;
        })[], createOptions?: CreateOptions): TransformablePropValue$1<"background-overlay", ({
            $$type: "background-color-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-gradient-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-image-overlay";
            value?: any;
            disabled?: boolean | undefined;
        })[]>;
        (value: (prev?: ({
            $$type: "background-color-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-gradient-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-image-overlay";
            value?: any;
            disabled?: boolean | undefined;
        })[] | undefined) => ({
            $$type: "background-color-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-gradient-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-image-overlay";
            value?: any;
            disabled?: boolean | undefined;
        })[], createOptions: CreateOptions): TransformablePropValue$1<"background-overlay", ({
            $$type: "background-color-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-gradient-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-image-overlay";
            value?: any;
            disabled?: boolean | undefined;
        })[]>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"background-overlay">;
        value: z.ZodType<({
            $$type: "background-color-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-gradient-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-image-overlay";
            value?: any;
            disabled?: boolean | undefined;
        })[], z.ZodTypeDef, ({
            $$type: "background-color-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-gradient-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-image-overlay";
            value?: any;
            disabled?: boolean | undefined;
        })[]>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "background-overlay";
        value: ({
            $$type: "background-color-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-gradient-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-image-overlay";
            value?: any;
            disabled?: boolean | undefined;
        })[];
        disabled?: boolean | undefined;
    }, {
        $$type: "background-overlay";
        value: ({
            $$type: "background-color-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-gradient-overlay";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "background-image-overlay";
            value?: any;
            disabled?: boolean | undefined;
        })[];
        disabled?: boolean | undefined;
    }>;
    key: "background-overlay";
};
type BackgroundOverlayPropValue = z.infer<typeof backgroundOverlayPropTypeUtil.schema>;
type BackgroundOverlayItemPropValue = z.infer<typeof backgroundOverlayItem>;

declare const backgroundColorOverlayPropTypeUtil: {
    extract: (prop: unknown) => any;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"background-color-overlay", any>;
    create: {
        (value: any): TransformablePropValue$1<"background-color-overlay", any>;
        (value: any, createOptions?: CreateOptions): TransformablePropValue$1<"background-color-overlay", any>;
        (value: (prev?: any) => any, createOptions: CreateOptions): TransformablePropValue$1<"background-color-overlay", any>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"background-color-overlay">;
        value: z.ZodType<any, z.ZodTypeDef, any>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "background-color-overlay";
        value?: any;
        disabled?: boolean | undefined;
    }, {
        $$type: "background-color-overlay";
        value?: any;
        disabled?: boolean | undefined;
    }>;
    key: "background-color-overlay";
};
type BackgroundColorOverlayPropValue = z.infer<typeof backgroundColorOverlayPropTypeUtil.schema>;

declare const backgroundImageOverlayPropTypeUtil: {
    extract: (prop: unknown) => any;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"background-image-overlay", any>;
    create: {
        (value: any): TransformablePropValue$1<"background-image-overlay", any>;
        (value: any, createOptions?: CreateOptions): TransformablePropValue$1<"background-image-overlay", any>;
        (value: (prev?: any) => any, createOptions: CreateOptions): TransformablePropValue$1<"background-image-overlay", any>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"background-image-overlay">;
        value: z.ZodType<any, z.ZodTypeDef, any>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "background-image-overlay";
        value?: any;
        disabled?: boolean | undefined;
    }, {
        $$type: "background-image-overlay";
        value?: any;
        disabled?: boolean | undefined;
    }>;
    key: "background-image-overlay";
};
type BackgroundImageOverlayPropValue = z.infer<typeof backgroundImageOverlayPropTypeUtil.schema>;

declare const backgroundGradientOverlayPropTypeUtil: {
    extract: (prop: unknown) => any;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"background-gradient-overlay", any>;
    create: {
        (value: any): TransformablePropValue$1<"background-gradient-overlay", any>;
        (value: any, createOptions?: CreateOptions): TransformablePropValue$1<"background-gradient-overlay", any>;
        (value: (prev?: any) => any, createOptions: CreateOptions): TransformablePropValue$1<"background-gradient-overlay", any>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"background-gradient-overlay">;
        value: z.ZodType<any, z.ZodTypeDef, any>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "background-gradient-overlay";
        value?: any;
        disabled?: boolean | undefined;
    }, {
        $$type: "background-gradient-overlay";
        value?: any;
        disabled?: boolean | undefined;
    }>;
    key: "background-gradient-overlay";
};
type BackgroundGradientOverlayPropValue = z.infer<typeof backgroundGradientOverlayPropTypeUtil.schema>;

declare const backgroundImagePositionOffsetPropTypeUtil: {
    extract: (prop: unknown) => any;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"background-image-position-offset", any>;
    create: {
        (value: any): TransformablePropValue$1<"background-image-position-offset", any>;
        (value: any, createOptions?: CreateOptions): TransformablePropValue$1<"background-image-position-offset", any>;
        (value: (prev?: any) => any, createOptions: CreateOptions): TransformablePropValue$1<"background-image-position-offset", any>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"background-image-position-offset">;
        value: z.ZodType<any, z.ZodTypeDef, any>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "background-image-position-offset";
        value?: any;
        disabled?: boolean | undefined;
    }, {
        $$type: "background-image-position-offset";
        value?: any;
        disabled?: boolean | undefined;
    }>;
    key: "background-image-position-offset";
};
type BackgroundImagePositionOffsetPropValue = z.infer<typeof backgroundImagePositionOffsetPropTypeUtil.schema>;

declare const backgroundImageSizeScalePropTypeUtil: {
    extract: (prop: unknown) => any;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"background-image-size-scale", any>;
    create: {
        (value: any): TransformablePropValue$1<"background-image-size-scale", any>;
        (value: any, createOptions?: CreateOptions): TransformablePropValue$1<"background-image-size-scale", any>;
        (value: (prev?: any) => any, createOptions: CreateOptions): TransformablePropValue$1<"background-image-size-scale", any>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"background-image-size-scale">;
        value: z.ZodType<any, z.ZodTypeDef, any>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "background-image-size-scale";
        value?: any;
        disabled?: boolean | undefined;
    }, {
        $$type: "background-image-size-scale";
        value?: any;
        disabled?: boolean | undefined;
    }>;
    key: "background-image-size-scale";
};
type BackgroundImageSizeScalePropValue = z.infer<typeof backgroundImageSizeScalePropTypeUtil.schema>;

declare const booleanPropTypeUtil: {
    extract: (prop: unknown) => boolean | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"boolean", boolean | null>;
    create: {
        (value: boolean | null): TransformablePropValue$1<"boolean", boolean | null>;
        (value: boolean | null, createOptions?: CreateOptions): TransformablePropValue$1<"boolean", boolean | null>;
        (value: (prev?: boolean | null | undefined) => boolean | null, createOptions: CreateOptions): TransformablePropValue$1<"boolean", boolean | null>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"boolean">;
        value: z.ZodType<boolean | null, z.ZodTypeDef, boolean | null>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "boolean";
        value: boolean | null;
        disabled?: boolean | undefined;
    }, {
        $$type: "boolean";
        value: boolean | null;
        disabled?: boolean | undefined;
    }>;
    key: "boolean";
};
type BooleanPropValue = z.infer<typeof booleanPropTypeUtil.schema>;

declare const colorStopPropTypeUtil: {
    extract: (prop: unknown) => {
        color?: any;
        offset?: any;
    } | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"color-stop", {
        color?: any;
        offset?: any;
    }>;
    create: {
        (value: {
            color?: any;
            offset?: any;
        }): TransformablePropValue$1<"color-stop", {
            color?: any;
            offset?: any;
        }>;
        (value: {
            color?: any;
            offset?: any;
        }, createOptions?: CreateOptions): TransformablePropValue$1<"color-stop", {
            color?: any;
            offset?: any;
        }>;
        (value: (prev?: {
            color?: any;
            offset?: any;
        } | undefined) => {
            color?: any;
            offset?: any;
        }, createOptions: CreateOptions): TransformablePropValue$1<"color-stop", {
            color?: any;
            offset?: any;
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"color-stop">;
        value: z.ZodType<{
            color?: any;
            offset?: any;
        }, z.ZodTypeDef, {
            color?: any;
            offset?: any;
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "color-stop";
        value: {
            color?: any;
            offset?: any;
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "color-stop";
        value: {
            color?: any;
            offset?: any;
        };
        disabled?: boolean | undefined;
    }>;
    key: "color-stop";
};
type ColorStopPropValue = z.infer<typeof colorStopPropTypeUtil.schema>;

declare const gradientColorStopPropTypeUtil: {
    extract: (prop: unknown) => {
        $$type: "color-stop";
        value: {
            color?: any;
            offset?: any;
        };
        disabled?: boolean | undefined;
    }[] | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"gradient-color-stop", {
        $$type: "color-stop";
        value: {
            color?: any;
            offset?: any;
        };
        disabled?: boolean | undefined;
    }[]>;
    create: {
        (value: {
            $$type: "color-stop";
            value: {
                color?: any;
                offset?: any;
            };
            disabled?: boolean | undefined;
        }[]): TransformablePropValue$1<"gradient-color-stop", {
            $$type: "color-stop";
            value: {
                color?: any;
                offset?: any;
            };
            disabled?: boolean | undefined;
        }[]>;
        (value: {
            $$type: "color-stop";
            value: {
                color?: any;
                offset?: any;
            };
            disabled?: boolean | undefined;
        }[], createOptions?: CreateOptions): TransformablePropValue$1<"gradient-color-stop", {
            $$type: "color-stop";
            value: {
                color?: any;
                offset?: any;
            };
            disabled?: boolean | undefined;
        }[]>;
        (value: (prev?: {
            $$type: "color-stop";
            value: {
                color?: any;
                offset?: any;
            };
            disabled?: boolean | undefined;
        }[] | undefined) => {
            $$type: "color-stop";
            value: {
                color?: any;
                offset?: any;
            };
            disabled?: boolean | undefined;
        }[], createOptions: CreateOptions): TransformablePropValue$1<"gradient-color-stop", {
            $$type: "color-stop";
            value: {
                color?: any;
                offset?: any;
            };
            disabled?: boolean | undefined;
        }[]>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"gradient-color-stop">;
        value: z.ZodType<{
            $$type: "color-stop";
            value: {
                color?: any;
                offset?: any;
            };
            disabled?: boolean | undefined;
        }[], z.ZodTypeDef, {
            $$type: "color-stop";
            value: {
                color?: any;
                offset?: any;
            };
            disabled?: boolean | undefined;
        }[]>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "gradient-color-stop";
        value: {
            $$type: "color-stop";
            value: {
                color?: any;
                offset?: any;
            };
            disabled?: boolean | undefined;
        }[];
        disabled?: boolean | undefined;
    }, {
        $$type: "gradient-color-stop";
        value: {
            $$type: "color-stop";
            value: {
                color?: any;
                offset?: any;
            };
            disabled?: boolean | undefined;
        }[];
        disabled?: boolean | undefined;
    }>;
    key: "gradient-color-stop";
};
type GradientColorStopPropValue = z.infer<typeof gradientColorStopPropTypeUtil.schema>;

declare const keyValuePropTypeUtil: {
    extract: (prop: unknown) => {
        value?: any;
        key?: any;
    } | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"key-value", {
        value?: any;
        key?: any;
    }>;
    create: {
        (value: {
            value?: any;
            key?: any;
        }): TransformablePropValue$1<"key-value", {
            value?: any;
            key?: any;
        }>;
        (value: {
            value?: any;
            key?: any;
        }, createOptions?: CreateOptions): TransformablePropValue$1<"key-value", {
            value?: any;
            key?: any;
        }>;
        (value: (prev?: {
            value?: any;
            key?: any;
        } | undefined) => {
            value?: any;
            key?: any;
        }, createOptions: CreateOptions): TransformablePropValue$1<"key-value", {
            value?: any;
            key?: any;
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"key-value">;
        value: z.ZodType<{
            value?: any;
            key?: any;
        }, z.ZodTypeDef, {
            value?: any;
            key?: any;
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "key-value";
        value: {
            value?: any;
            key?: any;
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "key-value";
        value: {
            value?: any;
            key?: any;
        };
        disabled?: boolean | undefined;
    }>;
    key: "key-value";
};
type KeyValuePropValue = z.infer<typeof keyValuePropTypeUtil.schema>;

declare const positionPropTypeUtil: {
    extract: (prop: unknown) => {
        x: {
            $$type: "size";
            value: {
                size: number;
                unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
            } | {
                size: "";
                unit: "auto";
            } | {
                size: string;
                unit: "custom";
            };
            disabled?: boolean | undefined;
        } | null;
        y: {
            $$type: "size";
            value: {
                size: number;
                unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
            } | {
                size: "";
                unit: "auto";
            } | {
                size: string;
                unit: "custom";
            };
            disabled?: boolean | undefined;
        } | null;
    } | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"object-position", {
        x: {
            $$type: "size";
            value: {
                size: number;
                unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
            } | {
                size: "";
                unit: "auto";
            } | {
                size: string;
                unit: "custom";
            };
            disabled?: boolean | undefined;
        } | null;
        y: {
            $$type: "size";
            value: {
                size: number;
                unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
            } | {
                size: "";
                unit: "auto";
            } | {
                size: string;
                unit: "custom";
            };
            disabled?: boolean | undefined;
        } | null;
    }>;
    create: {
        (value: {
            x: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
            y: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
        }): TransformablePropValue$1<"object-position", {
            x: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
            y: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
        }>;
        (value: {
            x: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
            y: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
        }, createOptions?: CreateOptions): TransformablePropValue$1<"object-position", {
            x: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
            y: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
        }>;
        (value: (prev?: {
            x: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
            y: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
        } | undefined) => {
            x: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
            y: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
        }, createOptions: CreateOptions): TransformablePropValue$1<"object-position", {
            x: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
            y: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
        }>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"object-position">;
        value: z.ZodType<{
            x: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
            y: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
        }, z.ZodTypeDef, {
            x: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
            y: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
        }>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "object-position";
        value: {
            x: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
            y: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
        };
        disabled?: boolean | undefined;
    }, {
        $$type: "object-position";
        value: {
            x: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
            y: {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                };
                disabled?: boolean | undefined;
            } | null;
        };
        disabled?: boolean | undefined;
    }>;
    key: "object-position";
};
type PositionPropTypeValue = z.infer<typeof positionPropTypeUtil.schema>;

declare const filterTypes: z.ZodUnion<[z.ZodObject<{
    $$type: z.ZodLiteral<"blur">;
    value: z.ZodType<any, z.ZodTypeDef, any>;
    disabled: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    $$type: "blur";
    value?: any;
    disabled?: boolean | undefined;
}, {
    $$type: "blur";
    value?: any;
    disabled?: boolean | undefined;
}>, z.ZodObject<{
    $$type: z.ZodLiteral<"brightness">;
    value: z.ZodType<any, z.ZodTypeDef, any>;
    disabled: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    $$type: "brightness";
    value?: any;
    disabled?: boolean | undefined;
}, {
    $$type: "brightness";
    value?: any;
    disabled?: boolean | undefined;
}>]>;
declare const filterPropTypeUtil: {
    extract: (prop: unknown) => ({
        $$type: "blur";
        value?: any;
        disabled?: boolean | undefined;
    } | {
        $$type: "brightness";
        value?: any;
        disabled?: boolean | undefined;
    })[] | null;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"filter", ({
        $$type: "blur";
        value?: any;
        disabled?: boolean | undefined;
    } | {
        $$type: "brightness";
        value?: any;
        disabled?: boolean | undefined;
    })[]>;
    create: {
        (value: ({
            $$type: "blur";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "brightness";
            value?: any;
            disabled?: boolean | undefined;
        })[]): TransformablePropValue$1<"filter", ({
            $$type: "blur";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "brightness";
            value?: any;
            disabled?: boolean | undefined;
        })[]>;
        (value: ({
            $$type: "blur";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "brightness";
            value?: any;
            disabled?: boolean | undefined;
        })[], createOptions?: CreateOptions): TransformablePropValue$1<"filter", ({
            $$type: "blur";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "brightness";
            value?: any;
            disabled?: boolean | undefined;
        })[]>;
        (value: (prev?: ({
            $$type: "blur";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "brightness";
            value?: any;
            disabled?: boolean | undefined;
        })[] | undefined) => ({
            $$type: "blur";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "brightness";
            value?: any;
            disabled?: boolean | undefined;
        })[], createOptions: CreateOptions): TransformablePropValue$1<"filter", ({
            $$type: "blur";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "brightness";
            value?: any;
            disabled?: boolean | undefined;
        })[]>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"filter">;
        value: z.ZodType<({
            $$type: "blur";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "brightness";
            value?: any;
            disabled?: boolean | undefined;
        })[], z.ZodTypeDef, ({
            $$type: "blur";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "brightness";
            value?: any;
            disabled?: boolean | undefined;
        })[]>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "filter";
        value: ({
            $$type: "blur";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "brightness";
            value?: any;
            disabled?: boolean | undefined;
        })[];
        disabled?: boolean | undefined;
    }, {
        $$type: "filter";
        value: ({
            $$type: "blur";
            value?: any;
            disabled?: boolean | undefined;
        } | {
            $$type: "brightness";
            value?: any;
            disabled?: boolean | undefined;
        })[];
        disabled?: boolean | undefined;
    }>;
    key: "filter";
};
type FilterPropValue = z.infer<typeof filterPropTypeUtil.schema>;
type FilterItemPropValue = z.infer<typeof filterTypes>;

declare const blurFilterPropTypeUtil: {
    extract: (prop: unknown) => any;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"blur", any>;
    create: {
        (value: any): TransformablePropValue$1<"blur", any>;
        (value: any, createOptions?: CreateOptions): TransformablePropValue$1<"blur", any>;
        (value: (prev?: any) => any, createOptions: CreateOptions): TransformablePropValue$1<"blur", any>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"blur">;
        value: z.ZodType<any, z.ZodTypeDef, any>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "blur";
        value?: any;
        disabled?: boolean | undefined;
    }, {
        $$type: "blur";
        value?: any;
        disabled?: boolean | undefined;
    }>;
    key: "blur";
};
type BlurFilterPropValue = z.infer<typeof blurFilterPropTypeUtil.schema>;

declare const brightnessFilterPropTypeUtil: {
    extract: (prop: unknown) => any;
    isValid: (prop: unknown) => prop is TransformablePropValue$1<"brightness", any>;
    create: {
        (value: any): TransformablePropValue$1<"brightness", any>;
        (value: any, createOptions?: CreateOptions): TransformablePropValue$1<"brightness", any>;
        (value: (prev?: any) => any, createOptions: CreateOptions): TransformablePropValue$1<"brightness", any>;
    };
    schema: z.ZodObject<{
        $$type: z.ZodLiteral<"brightness">;
        value: z.ZodType<any, z.ZodTypeDef, any>;
        disabled: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        $$type: "brightness";
        value?: any;
        disabled?: boolean | undefined;
    }, {
        $$type: "brightness";
        value?: any;
        disabled?: boolean | undefined;
    }>;
    key: "brightness";
};
type BrightnessFilterPropValue = z.infer<typeof brightnessFilterPropTypeUtil.schema>;

declare function mergeProps(current: Props, updates: Props): Props;

declare function shouldApplyEffect({ relation, terms }: Dependency, values: PropValue): boolean;
declare function evaluateTerm(term: DependencyTerm, actualValue: PropValue): boolean;

declare const transformableSchema: z.ZodObject<{
    $$type: z.ZodString;
    value: z.ZodAny;
    disabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    $$type: string;
    value?: any;
    disabled?: boolean | undefined;
}, {
    $$type: string;
    value?: any;
    disabled?: boolean | undefined;
}>;
type TransformablePropValue = z.infer<typeof transformableSchema>;
declare const isTransformable: (value: unknown) => value is TransformablePropValue;

declare const filterEmptyValues: <TValue extends PropValue>(value: TValue) => TValue | null;
type Nullish = null | undefined | '';
declare const isEmpty: (value: PropValue) => value is Nullish;

export { type AnyTransformable, type ArrayPropType, type ArrayPropValue, type BackgroundColorOverlayPropValue, type BackgroundGradientOverlayPropValue, type BackgroundImageOverlayPropValue, type BackgroundImagePositionOffsetPropValue, type BackgroundImageSizeScalePropValue, type BackgroundOverlayImagePropType, type BackgroundOverlayItemPropValue, type BackgroundOverlayPropType, type BackgroundOverlayPropValue, type BackgroundPropValue, type BlurFilterPropValue, type BooleanPropValue, type BorderRadiusPropValue, type BorderWidthPropValue, type BoxShadowPropValue, type BrightnessFilterPropValue, CLASSES_PROP_KEY, type ClassesPropValue, type ColorPropValue, type ColorStopPropValue, type CreateOptions, type Dependency, type DependencyEffect, type DependencyOperator, type DependencyTerm, type DimensionsPropValue, type FilterItemPropValue, type FilterPropValue, type GradientColorStopPropValue, type ImageAttachmentIdPropValue, type ImagePropValue, type ImageSrcPropValue, type KeyValuePropValue, type LayoutDirectionPropValue, type LinkPropValue, type NumberPropValue, type ObjectPropType, type ObjectPropValue, type PlainPropType, type PlainPropValue, type PositionPropTypeValue, type PropKey, type PropType, type PropTypeKey, type PropTypeUtil, type PropValue, type Props, type PropsSchema, type ShadowPropValue, type SizePropValue, type StringPropValue, type StrokePropValue, type TransformablePropType, type TransformablePropValue$1 as TransformablePropValue, type UnionPropType, type UrlPropValue, backgroundColorOverlayPropTypeUtil, backgroundGradientOverlayPropTypeUtil, backgroundImageOverlayPropTypeUtil, backgroundImagePositionOffsetPropTypeUtil, backgroundImageSizeScalePropTypeUtil, backgroundOverlayPropTypeUtil, backgroundPropTypeUtil, blurFilterPropTypeUtil, booleanPropTypeUtil, borderRadiusPropTypeUtil, borderWidthPropTypeUtil, boxShadowPropTypeUtil, brightnessFilterPropTypeUtil, classesPropTypeUtil, colorPropTypeUtil, colorStopPropTypeUtil, createArrayPropUtils, createPropUtils, dimensionsPropTypeUtil, evaluateTerm, filterEmptyValues, filterPropTypeUtil, gradientColorStopPropTypeUtil, imageAttachmentIdPropType, imagePropTypeUtil, imageSrcPropTypeUtil, isEmpty, isTransformable, keyValuePropTypeUtil, layoutDirectionPropTypeUtil, linkPropTypeUtil, mergeProps, numberPropTypeUtil, positionPropTypeUtil, shadowPropTypeUtil, shouldApplyEffect, sizePropTypeUtil, stringPropTypeUtil, strokePropTypeUtil, urlPropTypeUtil };
