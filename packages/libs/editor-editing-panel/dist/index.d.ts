import * as _elementor_locations from '@elementor/locations';
import { StyleDefinition, StyleDefinitionVariant, StyleDefinitionState, StyleDefinitionID } from '@elementor/editor-styles';
import * as react from 'react';
import { FC, PropsWithChildren, ReactNode, Dispatch, ComponentProps, ComponentType } from 'react';
import { Control as Control$1, ElementControl, Element, ElementType, ControlLayout, ControlItem } from '@elementor/editor-elements';
import * as _elementor_editor_props from '@elementor/editor-props';
import { PropKey, AnyTransformable, PropTypeUtil, PropsSchema, ObjectPropType, TransformablePropValue, PropValue } from '@elementor/editor-props';
import * as _emotion_styled from '@emotion/styled';
import * as _mui_system from '@mui/system';
import { Theme, ChipProps } from '@elementor/ui';
import { StylesProvider } from '@elementor/editor-styles-repository';
import * as _mui_material from '@mui/material';
import * as _elementor_editor_controls from '@elementor/editor-controls';
import { ControlComponent, AdornmentComponent } from '@elementor/editor-controls';
import * as zod from 'zod';
import * as _elementor_utils from '@elementor/utils';

type ValidationResult = {
    isValid: true;
    errorMessage: null;
} | {
    isValid: false;
    errorMessage: string;
};
type ValidationEvent = 'inputChange' | 'create';

declare const injectIntoCssClassConvert: (args: _elementor_locations.InjectArgs<{
    styleDef: StyleDefinition | null;
    successCallback: (newId: string) => void;
    canConvert: boolean;
}>) => void;

declare const injectIntoClassSelectorActions: (args: _elementor_locations.InjectArgs<object>) => void;

declare const CustomCssIndicator: () => react.JSX.Element | null;

declare const injectIntoPanelHeaderTop: (args: _elementor_locations.InjectArgs<object>) => void;

type SectionContentProps = PropsWithChildren<{
    gap?: number;
    sx?: {
        pt?: number;
    };
    'aria-label'?: string;
}>;
declare const SectionContent: FC<SectionContentProps>;

declare const SettingsControl: ({ control: { value, type } }: {
    control: Control$1 | ElementControl;
}) => react.JSX.Element | null;

type SettingsFieldProps = {
    bind: PropKey;
    propDisplayName: string;
    children: react.ReactNode;
};
declare const SettingsField: ({ bind, children, propDisplayName }: SettingsFieldProps) => react.JSX.Element | null;

declare const StyleIndicator: _emotion_styled.StyledComponent<_mui_system.MUIStyledCommonProps<Theme> & ({
    isOverridden?: boolean;
    getColor?: never;
} | {
    isOverridden?: boolean;
    getColor?: ((theme: Theme) => string) | null;
}), react.DetailedHTMLProps<react.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;

declare const injectIntoStyleTab: (args: _elementor_locations.InjectArgs<object>) => void;

type SectionType = {
    component?: () => react.JSX.Element;
    name: string;
    title: string;
    action?: {
        component: ReactNode;
        onClick: () => void;
    };
};
type Props$1 = {
    section: SectionType;
    fields?: string[];
    unmountOnExit?: boolean;
};
declare const StyleTabSection: ({ section, fields, unmountOnExit }: Props$1) => react.JSX.Element;

declare function useClassesProp(): string;

type ContextValue$1 = {
    element: Element;
    elementType: ElementType;
    settings: Record<string, AnyTransformable | null>;
};
type Props = PropsWithChildren<ContextValue$1>;
declare function ElementProvider({ children, element, elementType, settings }: Props): react.JSX.Element;
declare function useElement(): ContextValue$1;

type ContextValue = {
    setId: Dispatch<StyleDefinition['id'] | null>;
    meta: StyleDefinitionVariant['meta'];
    setMetaState: Dispatch<StyleDefinitionState>;
    canEdit?: boolean;
} & (ContextValueWithProvider | ContextValueWithoutProvider);
type ContextValueWithProvider = {
    id: StyleDefinitionID;
    provider: StylesProvider;
};
type ContextValueWithoutProvider = {
    id: null;
    provider: null;
};
declare function useStyle(): ContextValue;

type ControlRegistry = Record<string, {
    component: ControlComponent;
    layout: ControlLayout;
    propTypeUtil?: PropTypeUtil<string, any>;
}>;
declare const controlTypes: {
    readonly image: {
        readonly component: ControlComponent<({ sizes, label }: {
            sizes: {
                label: string;
                value: string;
            }[];
            label?: string;
        }) => react.JSX.Element>;
        readonly layout: "custom";
        readonly propTypeUtil: {
            extract: (prop: unknown) => {
                size?: any;
                src?: any;
            } | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"image", {
                size?: any;
                src?: any;
            }>;
            create: {
                (value: {
                    size?: any;
                    src?: any;
                }): _elementor_editor_props.TransformablePropValue<"image", {
                    size?: any;
                    src?: any;
                }>;
                (value: {
                    size?: any;
                    src?: any;
                }, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"image", {
                    size?: any;
                    src?: any;
                }>;
                (value: (prev?: {
                    size?: any;
                    src?: any;
                } | undefined) => {
                    size?: any;
                    src?: any;
                }, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"image", {
                    size?: any;
                    src?: any;
                }>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"image">;
                value: zod.ZodType<{
                    size?: any;
                    src?: any;
                }, zod.ZodTypeDef, {
                    size?: any;
                    src?: any;
                }>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
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
    };
    readonly 'svg-media': {
        readonly component: ControlComponent<() => react.JSX.Element>;
        readonly layout: "full";
        readonly propTypeUtil: {
            extract: (prop: unknown) => {
                url: null;
                id?: any;
            } | {
                id: null;
                url?: any;
            } | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"image-src", {
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
                }): _elementor_editor_props.TransformablePropValue<"image-src", {
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
                }, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"image-src", {
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
                }, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"image-src", {
                    url: null;
                    id?: any;
                } | {
                    id: null;
                    url?: any;
                }>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"image-src">;
                value: zod.ZodType<{
                    url: null;
                    id?: any;
                } | {
                    id: null;
                    url?: any;
                }, zod.ZodTypeDef, {
                    url: null;
                    id?: any;
                } | {
                    id: null;
                    url?: any;
                }>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
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
    };
    readonly text: {
        readonly component: ControlComponent<({ placeholder, error, inputValue, inputDisabled, helperText, sx, ariaLabel, }: {
            placeholder?: string;
            error?: boolean;
            inputValue?: string;
            inputDisabled?: boolean;
            helperText?: string;
            sx?: _mui_system.SxProps;
            ariaLabel?: string;
        }) => react.JSX.Element>;
        readonly layout: "full";
        readonly propTypeUtil: {
            extract: (prop: unknown) => string | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"string", string | null>;
            create: {
                (value: string | null): _elementor_editor_props.TransformablePropValue<"string", string | null>;
                (value: string | null, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"string", string | null>;
                (value: (prev?: string | null | undefined) => string | null, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"string", string | null>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"string">;
                value: zod.ZodType<string | null, zod.ZodTypeDef, string | null>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
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
    };
    readonly textarea: {
        readonly component: ControlComponent<({ placeholder, ariaLabel }: {
            placeholder?: string;
            ariaLabel?: string;
        }) => react.JSX.Element>;
        readonly layout: "full";
        readonly propTypeUtil: {
            extract: (prop: unknown) => string | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"string", string | null>;
            create: {
                (value: string | null): _elementor_editor_props.TransformablePropValue<"string", string | null>;
                (value: string | null, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"string", string | null>;
                (value: (prev?: string | null | undefined) => string | null, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"string", string | null>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"string">;
                value: zod.ZodType<string | null, zod.ZodTypeDef, string | null>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
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
    };
    readonly size: {
        readonly component: ControlComponent<({ variant, defaultUnit, units, placeholder, startIcon, anchorRef, extendedOptions, disableCustom, min, enablePropTypeUnits, id, ariaLabel, }: Omit<({
            placeholder?: string;
            startIcon?: react.ReactNode;
            extendedOptions?: _elementor_editor_controls.ExtendedOption[];
            disableCustom?: boolean;
            anchorRef?: react.RefObject<HTMLDivElement | null>;
            min?: number;
            enablePropTypeUnits?: boolean;
            id?: string;
            ariaLabel?: string;
        } & {
            units?: ("em" | "px" | "%" | "rem" | "vw" | "vh" | "ch")[] | undefined;
            defaultUnit?: "em" | "px" | "%" | "rem" | "vw" | "vh" | "ch" | undefined;
        } & {
            variant: "length";
        }) | ({
            placeholder?: string;
            startIcon?: react.ReactNode;
            extendedOptions?: _elementor_editor_controls.ExtendedOption[];
            disableCustom?: boolean;
            anchorRef?: react.RefObject<HTMLDivElement | null>;
            min?: number;
            enablePropTypeUnits?: boolean;
            id?: string;
            ariaLabel?: string;
        } & {
            units?: ("deg" | "rad" | "grad" | "turn")[] | undefined;
            defaultUnit?: "deg" | "rad" | "grad" | "turn" | undefined;
        } & {
            variant: "angle";
        }) | ({
            placeholder?: string;
            startIcon?: react.ReactNode;
            extendedOptions?: _elementor_editor_controls.ExtendedOption[];
            disableCustom?: boolean;
            anchorRef?: react.RefObject<HTMLDivElement | null>;
            min?: number;
            enablePropTypeUnits?: boolean;
            id?: string;
            ariaLabel?: string;
        } & {
            units?: ("s" | "ms")[] | undefined;
            defaultUnit?: "s" | "ms" | undefined;
        } & {
            variant: "time";
        }), "variant"> & {
            variant?: "length" | "time" | "angle";
        }) => react.JSX.Element>;
        readonly layout: "two-columns";
        readonly propTypeUtil: {
            extract: (prop: unknown) => {
                size: number;
                unit: "px" | "em" | "rem" | "%" | "vw" | "vh" | "ch";
            } | {
                size: number;
                unit: "deg" | "rad" | "grad" | "turn";
            } | {
                size: number;
                unit: "s" | "ms";
            } | {
                size: "";
                unit: "auto";
            } | {
                size: string;
                unit: "custom";
            } | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"size", {
                size: number;
                unit: "px" | "em" | "rem" | "%" | "vw" | "vh" | "ch";
            } | {
                size: number;
                unit: "deg" | "rad" | "grad" | "turn";
            } | {
                size: number;
                unit: "s" | "ms";
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
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh" | "ch";
                } | {
                    size: number;
                    unit: "deg" | "rad" | "grad" | "turn";
                } | {
                    size: number;
                    unit: "s" | "ms";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                }): _elementor_editor_props.TransformablePropValue<"size", {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh" | "ch";
                } | {
                    size: number;
                    unit: "deg" | "rad" | "grad" | "turn";
                } | {
                    size: number;
                    unit: "s" | "ms";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                }>;
                (value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh" | "ch";
                } | {
                    size: number;
                    unit: "deg" | "rad" | "grad" | "turn";
                } | {
                    size: number;
                    unit: "s" | "ms";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                }, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"size", {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh" | "ch";
                } | {
                    size: number;
                    unit: "deg" | "rad" | "grad" | "turn";
                } | {
                    size: number;
                    unit: "s" | "ms";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                }>;
                (value: (prev?: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh" | "ch";
                } | {
                    size: number;
                    unit: "deg" | "rad" | "grad" | "turn";
                } | {
                    size: number;
                    unit: "s" | "ms";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                } | undefined) => {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh" | "ch";
                } | {
                    size: number;
                    unit: "deg" | "rad" | "grad" | "turn";
                } | {
                    size: number;
                    unit: "s" | "ms";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                }, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"size", {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh" | "ch";
                } | {
                    size: number;
                    unit: "deg" | "rad" | "grad" | "turn";
                } | {
                    size: number;
                    unit: "s" | "ms";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                }>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"size">;
                value: zod.ZodType<{
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh" | "ch";
                } | {
                    size: number;
                    unit: "deg" | "rad" | "grad" | "turn";
                } | {
                    size: number;
                    unit: "s" | "ms";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                }, zod.ZodTypeDef, {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh" | "ch";
                } | {
                    size: number;
                    unit: "deg" | "rad" | "grad" | "turn";
                } | {
                    size: number;
                    unit: "s" | "ms";
                } | {
                    size: "";
                    unit: "auto";
                } | {
                    size: string;
                    unit: "custom";
                }>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
                $$type: "size";
                value: {
                    size: number;
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh" | "ch";
                } | {
                    size: number;
                    unit: "deg" | "rad" | "grad" | "turn";
                } | {
                    size: number;
                    unit: "s" | "ms";
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
                    unit: "px" | "em" | "rem" | "%" | "vw" | "vh" | "ch";
                } | {
                    size: number;
                    unit: "deg" | "rad" | "grad" | "turn";
                } | {
                    size: number;
                    unit: "s" | "ms";
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
    };
    readonly select: {
        readonly component: ControlComponent<({ collectionId, options, ...props }: {
            options: {
                label: string;
                value: _elementor_editor_props.StringPropValue["value"];
                disabled?: boolean;
            }[];
            onChange?: (newValue: string | null, previousValue: string | null | undefined) => void;
            MenuProps?: _mui_material.SelectProps["MenuProps"];
            ariaLabel?: string;
        } & {
            collectionId?: "off-canvas";
        }) => react.JSX.Element>;
        readonly layout: "two-columns";
        readonly propTypeUtil: {
            extract: (prop: unknown) => string | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"string", string | null>;
            create: {
                (value: string | null): _elementor_editor_props.TransformablePropValue<"string", string | null>;
                (value: string | null, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"string", string | null>;
                (value: (prev?: string | null | undefined) => string | null, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"string", string | null>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"string">;
                value: zod.ZodType<string | null, zod.ZodTypeDef, string | null>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
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
    };
    readonly chips: {
        readonly component: ControlComponent<({ options }: {
            options: {
                label: string;
                value: string;
            }[];
        }) => react.JSX.Element>;
        readonly layout: "full";
        readonly propTypeUtil: {
            extract: (prop: unknown) => {
                $$type: "string";
                value: string | null;
                disabled?: boolean | undefined;
            }[] | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<string, {
                $$type: "string";
                value: string | null;
                disabled?: boolean | undefined;
            }[]>;
            create: {
                (value: {
                    $$type: "string";
                    value: string | null;
                    disabled?: boolean | undefined;
                }[]): _elementor_editor_props.TransformablePropValue<string, {
                    $$type: "string";
                    value: string | null;
                    disabled?: boolean | undefined;
                }[]>;
                (value: {
                    $$type: "string";
                    value: string | null;
                    disabled?: boolean | undefined;
                }[], createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<string, {
                    $$type: "string";
                    value: string | null;
                    disabled?: boolean | undefined;
                }[]>;
                (value: (prev?: {
                    $$type: "string";
                    value: string | null;
                    disabled?: boolean | undefined;
                }[] | undefined) => {
                    $$type: "string";
                    value: string | null;
                    disabled?: boolean | undefined;
                }[], createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<string, {
                    $$type: "string";
                    value: string | null;
                    disabled?: boolean | undefined;
                }[]>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<string>;
                value: zod.ZodType<{
                    $$type: "string";
                    value: string | null;
                    disabled?: boolean | undefined;
                }[], zod.ZodTypeDef, {
                    $$type: "string";
                    value: string | null;
                    disabled?: boolean | undefined;
                }[]>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
                $$type: string;
                value: {
                    $$type: "string";
                    value: string | null;
                    disabled?: boolean | undefined;
                }[];
                disabled?: boolean | undefined;
            }, {
                $$type: string;
                value: {
                    $$type: "string";
                    value: string | null;
                    disabled?: boolean | undefined;
                }[];
                disabled?: boolean | undefined;
            }>;
            key: string;
        };
    };
    readonly link: {
        readonly component: ControlComponent<(props: {
            queryOptions: {
                params: Record<string, unknown>;
                url: string;
            };
            allowCustomValues?: boolean;
            minInputLength?: number;
            placeholder?: string;
            label?: string;
            ariaLabel?: string;
        } & {
            context: {
                elementId: string;
            };
        }) => react.JSX.Element>;
        readonly layout: "custom";
        readonly propTypeUtil: {
            extract: (prop: unknown) => {
                destination?: any;
                isTargetBlank?: any;
                tag?: any;
            } | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"link", {
                destination?: any;
                isTargetBlank?: any;
                tag?: any;
            }>;
            create: {
                (value: {
                    destination?: any;
                    isTargetBlank?: any;
                    tag?: any;
                }): _elementor_editor_props.TransformablePropValue<"link", {
                    destination?: any;
                    isTargetBlank?: any;
                    tag?: any;
                }>;
                (value: {
                    destination?: any;
                    isTargetBlank?: any;
                    tag?: any;
                }, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"link", {
                    destination?: any;
                    isTargetBlank?: any;
                    tag?: any;
                }>;
                (value: (prev?: {
                    destination?: any;
                    isTargetBlank?: any;
                    tag?: any;
                } | undefined) => {
                    destination?: any;
                    isTargetBlank?: any;
                    tag?: any;
                }, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"link", {
                    destination?: any;
                    isTargetBlank?: any;
                    tag?: any;
                }>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"link">;
                value: zod.ZodType<{
                    destination?: any;
                    isTargetBlank?: any;
                    tag?: any;
                }, zod.ZodTypeDef, {
                    destination?: any;
                    isTargetBlank?: any;
                    tag?: any;
                }>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
                $$type: "link";
                value: {
                    destination?: any;
                    isTargetBlank?: any;
                    tag?: any;
                };
                disabled?: boolean | undefined;
            }, {
                $$type: "link";
                value: {
                    destination?: any;
                    isTargetBlank?: any;
                    tag?: any;
                };
                disabled?: boolean | undefined;
            }>;
            key: "link";
        };
    };
    readonly query: {
        readonly component: ControlComponent<(props: {
            queryOptions: {
                params: Record<string, unknown>;
                url: string;
            };
            allowCustomValues?: boolean;
            minInputLength?: number;
            placeholder?: string;
            onSetValue?: (value: any | null) => void;
            ariaLabel?: string;
        }) => react.JSX.Element>;
        readonly layout: "full";
        readonly propTypeUtil: {
            extract: (prop: unknown) => {
                id?: any;
                label?: any;
            } | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"query", {
                id?: any;
                label?: any;
            }>;
            create: {
                (value: {
                    id?: any;
                    label?: any;
                }): _elementor_editor_props.TransformablePropValue<"query", {
                    id?: any;
                    label?: any;
                }>;
                (value: {
                    id?: any;
                    label?: any;
                }, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"query", {
                    id?: any;
                    label?: any;
                }>;
                (value: (prev?: {
                    id?: any;
                    label?: any;
                } | undefined) => {
                    id?: any;
                    label?: any;
                }, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"query", {
                    id?: any;
                    label?: any;
                }>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"query">;
                value: zod.ZodType<{
                    id?: any;
                    label?: any;
                }, zod.ZodTypeDef, {
                    id?: any;
                    label?: any;
                }>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
                $$type: "query";
                value: {
                    id?: any;
                    label?: any;
                };
                disabled?: boolean | undefined;
            }, {
                $$type: "query";
                value: {
                    id?: any;
                    label?: any;
                };
                disabled?: boolean | undefined;
            }>;
            key: "query";
        };
    };
    readonly url: {
        readonly component: ControlComponent<({ placeholder, ariaLabel }: {
            placeholder?: string;
            ariaLabel?: string;
        }) => react.JSX.Element>;
        readonly layout: "full";
        readonly propTypeUtil: {
            extract: (prop: unknown) => string | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"string", string | null>;
            create: {
                (value: string | null): _elementor_editor_props.TransformablePropValue<"string", string | null>;
                (value: string | null, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"string", string | null>;
                (value: (prev?: string | null | undefined) => string | null, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"string", string | null>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"string">;
                value: zod.ZodType<string | null, zod.ZodTypeDef, string | null>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
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
    };
    readonly switch: {
        readonly component: ControlComponent<() => react.JSX.Element>;
        readonly layout: "two-columns";
        readonly propTypeUtil: {
            extract: (prop: unknown) => boolean | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"boolean", boolean | null>;
            create: {
                (value: boolean | null): _elementor_editor_props.TransformablePropValue<"boolean", boolean | null>;
                (value: boolean | null, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"boolean", boolean | null>;
                (value: (prev?: boolean | null | undefined) => boolean | null, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"boolean", boolean | null>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"boolean">;
                value: zod.ZodType<boolean | null, zod.ZodTypeDef, boolean | null>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
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
    };
    readonly number: {
        readonly component: ControlComponent<({ placeholder: labelPlaceholder, max, min, step, shouldForceInt, startIcon, }: {
            placeholder?: string;
            max?: number;
            min?: number;
            step?: number;
            shouldForceInt?: boolean;
            startIcon?: react.ReactNode;
        }) => react.JSX.Element>;
        readonly layout: "two-columns";
        readonly propTypeUtil: {
            extract: (prop: unknown) => number | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"number", number | null>;
            create: {
                (value: number | null): _elementor_editor_props.TransformablePropValue<"number", number | null>;
                (value: number | null, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"number", number | null>;
                (value: (prev?: number | null | undefined) => number | null, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"number", number | null>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"number">;
                value: zod.ZodType<number | null, zod.ZodTypeDef, number | null>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
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
    };
    readonly repeatable: {
        readonly component: ControlComponent<({ repeaterLabel, childControlConfig, showDuplicate, showToggle, initialValues, patternLabel, placeholder, propKey, addItemTooltipProps, }: {
            label: string;
            repeaterLabel: string;
            childControlConfig: {
                component: React.ComponentType;
                props?: Record<string, unknown>;
                propTypeUtil: PropTypeUtil<string, any>;
                label?: string;
                isItemDisabled?: (item: {
                    disabled?: boolean;
                } & {
                    $$type: string;
                    value: _elementor_editor_props.PropValue;
                    disabled?: boolean;
                }) => boolean;
            };
            showDuplicate?: boolean;
            showToggle?: boolean;
            initialValues?: object;
            patternLabel?: string;
            placeholder?: string;
            propKey?: string;
            addItemTooltipProps?: {
                disabled?: boolean;
                enableTooltip?: boolean;
                tooltipContent?: react.ReactNode;
                newItemIndex?: number;
                ariaLabel?: string;
            };
        }) => react.JSX.Element | null>;
        readonly layout: "full";
        readonly propTypeUtil: undefined;
    };
    readonly 'key-value': {
        readonly component: ControlComponent<(props?: {
            keyName?: string;
            valueName?: string;
            regexKey?: string;
            regexValue?: string;
            validationErrorMessage?: string;
            escapeHtml?: boolean;
            getHelperText?: (key: string, value: string) => {
                keyHelper?: string;
                valueHelper?: string;
            };
        }) => react.JSX.Element>;
        readonly layout: "full";
        readonly propTypeUtil: {
            extract: (prop: unknown) => {
                value?: any;
                key?: any;
            } | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"key-value", {
                value?: any;
                key?: any;
            }>;
            create: {
                (value: {
                    value?: any;
                    key?: any;
                }): _elementor_editor_props.TransformablePropValue<"key-value", {
                    value?: any;
                    key?: any;
                }>;
                (value: {
                    value?: any;
                    key?: any;
                }, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"key-value", {
                    value?: any;
                    key?: any;
                }>;
                (value: (prev?: {
                    value?: any;
                    key?: any;
                } | undefined) => {
                    value?: any;
                    key?: any;
                }, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"key-value", {
                    value?: any;
                    key?: any;
                }>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"key-value">;
                value: zod.ZodType<{
                    value?: any;
                    key?: any;
                }, zod.ZodTypeDef, {
                    value?: any;
                    key?: any;
                }>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
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
    };
    readonly 'html-tag': {
        readonly component: ControlComponent<({ options, onChange, fallbackLabels }: {
            options: {
                label: string;
                value: _elementor_editor_props.StringPropValue["value"];
                disabled?: boolean;
            }[];
            onChange?: (newValue: string | null, previousValue: string | null | undefined) => void;
            fallbackLabels?: Record<string, string>;
        }) => react.JSX.Element>;
        readonly layout: "two-columns";
        readonly propTypeUtil: {
            extract: (prop: unknown) => string | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"string", string | null>;
            create: {
                (value: string | null): _elementor_editor_props.TransformablePropValue<"string", string | null>;
                (value: string | null, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"string", string | null>;
                (value: (prev?: string | null | undefined) => string | null, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"string", string | null>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"string">;
                value: zod.ZodType<string | null, zod.ZodTypeDef, string | null>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
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
    };
    readonly toggle: {
        readonly component: ControlComponent<({ options, fullWidth, size, exclusive, maxItems, convertOptions, }: _elementor_editor_controls.ToggleControlProps<_elementor_editor_props.StringPropValue["value"]>) => react.JSX.Element>;
        readonly layout: "full";
        readonly propTypeUtil: {
            extract: (prop: unknown) => string | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"string", string | null>;
            create: {
                (value: string | null): _elementor_editor_props.TransformablePropValue<"string", string | null>;
                (value: string | null, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"string", string | null>;
                (value: (prev?: string | null | undefined) => string | null, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"string", string | null>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"string">;
                value: zod.ZodType<string | null, zod.ZodTypeDef, string | null>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
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
    };
    readonly 'date-time': {
        readonly component: ControlComponent<({ inputDisabled }: {
            inputDisabled?: boolean;
        }) => react.JSX.Element>;
        readonly layout: "full";
        readonly propTypeUtil: {
            extract: (prop: unknown) => {
                date?: any;
                time?: any;
            } | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"date-time", {
                date?: any;
                time?: any;
            }>;
            create: {
                (value: {
                    date?: any;
                    time?: any;
                }): _elementor_editor_props.TransformablePropValue<"date-time", {
                    date?: any;
                    time?: any;
                }>;
                (value: {
                    date?: any;
                    time?: any;
                }, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"date-time", {
                    date?: any;
                    time?: any;
                }>;
                (value: (prev?: {
                    date?: any;
                    time?: any;
                } | undefined) => {
                    date?: any;
                    time?: any;
                }, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"date-time", {
                    date?: any;
                    time?: any;
                }>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"date-time">;
                value: zod.ZodType<{
                    date?: any;
                    time?: any;
                }, zod.ZodTypeDef, {
                    date?: any;
                    time?: any;
                }>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
                $$type: "date-time";
                value: {
                    date?: any;
                    time?: any;
                };
                disabled?: boolean | undefined;
            }, {
                $$type: "date-time";
                value: {
                    date?: any;
                    time?: any;
                };
                disabled?: boolean | undefined;
            }>;
            key: "date-time";
        };
    };
    readonly video: {
        readonly component: ControlComponent<() => react.JSX.Element>;
        readonly layout: "full";
        readonly propTypeUtil: {
            extract: (prop: unknown) => {
                url: null;
                id?: any;
            } | {
                id: null;
                url?: any;
            } | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"video-src", {
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
                }): _elementor_editor_props.TransformablePropValue<"video-src", {
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
                }, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"video-src", {
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
                }, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"video-src", {
                    url: null;
                    id?: any;
                } | {
                    id: null;
                    url?: any;
                }>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"video-src">;
                value: zod.ZodType<{
                    url: null;
                    id?: any;
                } | {
                    id: null;
                    url?: any;
                }, zod.ZodTypeDef, {
                    url: null;
                    id?: any;
                } | {
                    id: null;
                    url?: any;
                }>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
                $$type: "video-src";
                value: {
                    url: null;
                    id?: any;
                } | {
                    id: null;
                    url?: any;
                };
                disabled?: boolean | undefined;
            }, {
                $$type: "video-src";
                value: {
                    url: null;
                    id?: any;
                } | {
                    id: null;
                    url?: any;
                };
                disabled?: boolean | undefined;
            }>;
            key: "video-src";
        };
    };
    readonly 'inline-editing': {
        readonly component: ControlComponent<({ sx, attributes, props, }: {
            sx?: _mui_system.SxProps<_mui_material.Theme>;
            attributes?: Record<string, string>;
            props?: react.ComponentProps<"div">;
        }) => react.JSX.Element>;
        readonly layout: "full";
        readonly propTypeUtil: {
            extract: (prop: unknown) => {
                content: {
                    $$type: "string";
                    value: string | null;
                    disabled?: boolean | undefined;
                } | null;
                children: unknown[];
            } | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"html-v3", {
                content: {
                    $$type: "string";
                    value: string | null;
                    disabled?: boolean | undefined;
                } | null;
                children: unknown[];
            }>;
            create: {
                (value: {
                    content: {
                        $$type: "string";
                        value: string | null;
                        disabled?: boolean | undefined;
                    } | null;
                    children: unknown[];
                }): _elementor_editor_props.TransformablePropValue<"html-v3", {
                    content: {
                        $$type: "string";
                        value: string | null;
                        disabled?: boolean | undefined;
                    } | null;
                    children: unknown[];
                }>;
                (value: {
                    content: {
                        $$type: "string";
                        value: string | null;
                        disabled?: boolean | undefined;
                    } | null;
                    children: unknown[];
                }, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"html-v3", {
                    content: {
                        $$type: "string";
                        value: string | null;
                        disabled?: boolean | undefined;
                    } | null;
                    children: unknown[];
                }>;
                (value: (prev?: {
                    content: {
                        $$type: "string";
                        value: string | null;
                        disabled?: boolean | undefined;
                    } | null;
                    children: unknown[];
                } | undefined) => {
                    content: {
                        $$type: "string";
                        value: string | null;
                        disabled?: boolean | undefined;
                    } | null;
                    children: unknown[];
                }, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"html-v3", {
                    content: {
                        $$type: "string";
                        value: string | null;
                        disabled?: boolean | undefined;
                    } | null;
                    children: unknown[];
                }>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"html-v3">;
                value: zod.ZodType<{
                    content: {
                        $$type: "string";
                        value: string | null;
                        disabled?: boolean | undefined;
                    } | null;
                    children: unknown[];
                }, zod.ZodTypeDef, {
                    content: {
                        $$type: "string";
                        value: string | null;
                        disabled?: boolean | undefined;
                    } | null;
                    children: unknown[];
                }>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
                $$type: "html-v3";
                value: {
                    content: {
                        $$type: "string";
                        value: string | null;
                        disabled?: boolean | undefined;
                    } | null;
                    children: unknown[];
                };
                disabled?: boolean | undefined;
            }, {
                $$type: "html-v3";
                value: {
                    content: {
                        $$type: "string";
                        value: string | null;
                        disabled?: boolean | undefined;
                    } | null;
                    children: unknown[];
                };
                disabled?: boolean | undefined;
            }>;
            key: "html-v3";
        };
    };
    readonly email: {
        readonly component: ControlComponent<() => react.JSX.Element>;
        readonly layout: "custom";
        readonly propTypeUtil: {
            extract: (prop: unknown) => {
                message?: any;
                to?: any;
                subject?: any;
                from?: any;
                "meta-data"?: any;
                "send-as"?: any;
                "from-name"?: any;
                "reply-to"?: any;
                cc?: any;
                bcc?: any;
            } | null;
            isValid: (prop: unknown) => prop is _elementor_editor_props.TransformablePropValue<"email", {
                message?: any;
                to?: any;
                subject?: any;
                from?: any;
                "meta-data"?: any;
                "send-as"?: any;
                "from-name"?: any;
                "reply-to"?: any;
                cc?: any;
                bcc?: any;
            }>;
            create: {
                (value: {
                    message?: any;
                    to?: any;
                    subject?: any;
                    from?: any;
                    "meta-data"?: any;
                    "send-as"?: any;
                    "from-name"?: any;
                    "reply-to"?: any;
                    cc?: any;
                    bcc?: any;
                }): _elementor_editor_props.TransformablePropValue<"email", {
                    message?: any;
                    to?: any;
                    subject?: any;
                    from?: any;
                    "meta-data"?: any;
                    "send-as"?: any;
                    "from-name"?: any;
                    "reply-to"?: any;
                    cc?: any;
                    bcc?: any;
                }>;
                (value: {
                    message?: any;
                    to?: any;
                    subject?: any;
                    from?: any;
                    "meta-data"?: any;
                    "send-as"?: any;
                    "from-name"?: any;
                    "reply-to"?: any;
                    cc?: any;
                    bcc?: any;
                }, createOptions?: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"email", {
                    message?: any;
                    to?: any;
                    subject?: any;
                    from?: any;
                    "meta-data"?: any;
                    "send-as"?: any;
                    "from-name"?: any;
                    "reply-to"?: any;
                    cc?: any;
                    bcc?: any;
                }>;
                (value: (prev?: {
                    message?: any;
                    to?: any;
                    subject?: any;
                    from?: any;
                    "meta-data"?: any;
                    "send-as"?: any;
                    "from-name"?: any;
                    "reply-to"?: any;
                    cc?: any;
                    bcc?: any;
                } | undefined) => {
                    message?: any;
                    to?: any;
                    subject?: any;
                    from?: any;
                    "meta-data"?: any;
                    "send-as"?: any;
                    "from-name"?: any;
                    "reply-to"?: any;
                    cc?: any;
                    bcc?: any;
                }, createOptions: _elementor_editor_props.CreateOptions): _elementor_editor_props.TransformablePropValue<"email", {
                    message?: any;
                    to?: any;
                    subject?: any;
                    from?: any;
                    "meta-data"?: any;
                    "send-as"?: any;
                    "from-name"?: any;
                    "reply-to"?: any;
                    cc?: any;
                    bcc?: any;
                }>;
            };
            schema: zod.ZodObject<{
                $$type: zod.ZodLiteral<"email">;
                value: zod.ZodType<{
                    message?: any;
                    to?: any;
                    subject?: any;
                    from?: any;
                    "meta-data"?: any;
                    "send-as"?: any;
                    "from-name"?: any;
                    "reply-to"?: any;
                    cc?: any;
                    bcc?: any;
                }, zod.ZodTypeDef, {
                    message?: any;
                    to?: any;
                    subject?: any;
                    from?: any;
                    "meta-data"?: any;
                    "send-as"?: any;
                    "from-name"?: any;
                    "reply-to"?: any;
                    cc?: any;
                    bcc?: any;
                }>;
                disabled: zod.ZodOptional<zod.ZodBoolean>;
            }, "strict", zod.ZodTypeAny, {
                $$type: "email";
                value: {
                    message?: any;
                    to?: any;
                    subject?: any;
                    from?: any;
                    "meta-data"?: any;
                    "send-as"?: any;
                    "from-name"?: any;
                    "reply-to"?: any;
                    cc?: any;
                    bcc?: any;
                };
                disabled?: boolean | undefined;
            }, {
                $$type: "email";
                value: {
                    message?: any;
                    to?: any;
                    subject?: any;
                    from?: any;
                    "meta-data"?: any;
                    "send-as"?: any;
                    "from-name"?: any;
                    "reply-to"?: any;
                    cc?: any;
                    bcc?: any;
                };
                disabled?: boolean | undefined;
            }>;
            key: "email";
        };
    };
};
type ControlType = keyof typeof controlTypes;
type ControlTypes = {
    [key in ControlType]: (typeof controlTypes)[key]['component'];
};
declare class ControlsRegistry {
    private readonly controlsRegistry;
    constructor(controlsRegistry: ControlRegistry);
    get(type: ControlType): ControlComponent;
    getLayout(type: ControlType): ControlLayout;
    getPropTypeUtil(type: ControlType): PropTypeUtil<string, any> | undefined;
    registry(): ControlRegistry;
    register(type: string, component: ControlComponent, layout: ControlLayout, propTypeUtil?: PropTypeUtil<string, any>): void;
    unregister(type: string): void;
}
declare const controlsRegistry: ControlsRegistry;

type IsRequired<T, K extends keyof T> = object extends Pick<T, K> ? false : true;
type AnyPropertyRequired<T> = {
    [K in keyof T]: IsRequired<T, K>;
}[keyof T] extends true ? true : false;
type ControlProps<T extends ControlType> = AnyPropertyRequired<ComponentProps<ControlTypes[T]>> extends true ? {
    props: ComponentProps<ControlTypes[T]>;
    type: T;
} : {
    props?: ComponentProps<ControlTypes[T]>;
    type: T;
};
declare const Control: <T extends ControlType>({ props, type }: ControlProps<T>) => react.JSX.Element;

declare const StylesProviderCannotUpdatePropsError: {
    new ({ cause, context }?: {
        cause?: _elementor_utils.ElementorErrorOptions["cause"];
        context?: {
            providerKey: string;
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

declare const createTopLevelObjectType: ({ schema }: {
    schema: PropsSchema;
}) => ObjectPropType;

declare const useCustomCss: () => {
    customCss: {
        raw: string;
    } | null;
    setCustomCss: (raw: string, { history: { propDisplayName } }: {
        history: {
            propDisplayName: string;
        };
    }) => void;
};

declare const useStateByElement: <T>(key: string, initialValue: T) => readonly [T, (newValue: T) => void];

declare const HISTORY_DEBOUNCE_WAIT = 800;
type TitleOptions = {
    provider: StylesProvider | null;
    styleId: string | null;
    elementId: string;
};
type SubtitleOptions = TitleOptions & {
    propDisplayName: string;
};
declare const getTitle: ({ provider, styleId, elementId }: TitleOptions) => string;
declare const getSubtitle: ({ provider, styleId, propDisplayName, elementId }: SubtitleOptions) => string;

declare const useStylesRerender: () => void;

declare function init(): void;

declare const usePanelActions: () => {
    open: () => Promise<void>;
    close: () => Promise<void>;
};
declare const usePanelStatus: () => {
    isOpen: boolean;
    isBlocked: boolean;
};

type Colors = {
    name: ChipProps['color'];
    getThemeColor: ((theme: Theme) => string) | null;
};
declare const registerStyleProviderToColors: (provider: string, colors: Colors) => void;

type FieldType = 'settings' | 'styles';
type FieldIndicator = {
    id: string;
    indicator: AdornmentComponent;
    priority: number;
};
declare const FIELD_TYPE: {
    SETTINGS: "settings";
    STYLES: "styles";
};
declare const registerFieldIndicator: ({ fieldType, id, indicator, priority, }: FieldIndicator & {
    fieldType: FieldType;
}) => void;
declare const getFieldIndicators: (fieldType: FieldType) => {
    id: string;
    Adornment: AdornmentComponent;
}[];

type EditingPanelReplacement = {
    condition: (element: Element, elementType: ElementType) => boolean;
    component: ComponentType;
    priority: number;
};
declare const registerEditingPanelReplacement: ({ id, priority, ...props }: Omit<EditingPanelReplacement, "priority"> & {
    id: string;
    priority?: number;
}) => void;

declare function doGetAppliedClasses(elementId: string, classesPropType?: string): string[];
declare function doApplyClasses(elementId: string, classIds: StyleDefinitionID[], classesPropType?: string): void;
declare function doUnapplyClass(elementId: string, classId: StyleDefinitionID, classesPropType?: string): boolean;

type LicenseConfig = {
    expired: boolean;
};
declare function setLicenseConfig(newConfig: Partial<LicenseConfig>): void;

type DynamicTags = Record<DynamicTag['name'], DynamicTag>;
type DynamicTag = {
    name: string;
    label: string;
    group: string;
    categories: string[];
    atomic_controls: ControlItem[];
    props_schema: PropsSchema;
    meta?: {
        origin: string;
        required_license: string;
    };
};
type DynamicPropValue = TransformablePropValue<'dynamic', {
    name: string;
    settings?: Record<string, unknown>;
}>;
type DynamicTagsManager = {
    createTag: (id: string, name: string, settings: Record<string, unknown>) => TagInstance;
    loadTagDataFromCache: (tag: TagInstance) => unknown;
    refreshCacheFromServer: (callback: () => void) => void;
};
type TagInstance = {
    options: {
        id: string;
        name: string;
    };
    model: {
        toJSON: () => Record<string, unknown>;
    };
};

declare const isDynamicPropValue: (prop: PropValue) => prop is DynamicPropValue;

export { Control as BaseControl, type ControlType, CustomCssIndicator, type DynamicTag, type DynamicTags, type DynamicTagsManager, ElementProvider, FIELD_TYPE, HISTORY_DEBOUNCE_WAIT, SectionContent, SettingsControl, SettingsField, StyleIndicator, StyleTabSection, StylesProviderCannotUpdatePropsError, type ValidationEvent, type ValidationResult, controlsRegistry, createTopLevelObjectType, doApplyClasses, doGetAppliedClasses, doUnapplyClass, getFieldIndicators, getSubtitle, getTitle, init, injectIntoClassSelectorActions, injectIntoCssClassConvert, injectIntoPanelHeaderTop, injectIntoStyleTab, isDynamicPropValue, registerEditingPanelReplacement, registerFieldIndicator, registerStyleProviderToColors, setLicenseConfig, useClassesProp, useCustomCss, useElement, usePanelActions, usePanelStatus, useStateByElement, useStyle, useStylesRerender };
