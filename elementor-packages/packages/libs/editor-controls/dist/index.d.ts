import * as React$1 from 'react';
import { RefObject, ReactNode, FC, PropsWithChildren, ComponentType } from 'react';
import { StringPropValue, PropTypeUtil, PropValue, PropKey, SizePropValue, PropType, CreateOptions } from '@elementor/editor-props';
import { UnstableColorFieldProps, ToggleButtonProps, StackProps, FormLabelProps } from '@elementor/ui';
import * as _elementor_locations from '@elementor/locations';

type ImageControlProps = {
    sizes: {
        label: string;
        value: string;
    }[];
    showMode?: 'all' | 'media' | 'sizes';
};
declare const ImageControl: ControlComponent<({ sizes, showMode }: ImageControlProps) => React$1.JSX.Element>;

declare const TextControl: ControlComponent<({ placeholder }: {
    placeholder?: string;
}) => React$1.JSX.Element>;

type Props$6 = {
    placeholder?: string;
};
declare const TextAreaControl: ControlComponent<({ placeholder }: Props$6) => React$1.JSX.Element>;

declare const defaultUnits: readonly ["px", "%", "em", "rem", "vw", "vh"];
declare const defaultExtendedOptions: readonly ["auto", "custom"];
type Unit = (typeof defaultUnits)[number];
type ExtendedOption = (typeof defaultExtendedOptions)[number];

type SizeControlProps = {
    placeholder?: string;
    startIcon?: React$1.ReactNode;
    units?: Unit[];
    extendedOptions?: ExtendedOption[];
    disableCustom?: boolean;
    anchorRef?: RefObject<HTMLDivElement | null>;
    defaultUnit?: Unit;
};
declare const SizeControl: ControlComponent<(props: SizeControlProps) => React$1.JSX.Element>;

declare const StrokeControl: ControlComponent<() => React$1.JSX.Element>;

declare const BoxShadowRepeaterControl: ControlComponent<() => React$1.JSX.Element>;

declare const FilterRepeaterControl: ControlComponent<() => React$1.JSX.Element>;

type Props$5 = {
    options: Array<{
        label: string;
        value: StringPropValue['value'];
        disabled?: boolean;
    }>;
    onChange?: (newValue: string | null, previousValue: string | null | undefined) => void;
};
declare const SelectControl: ControlComponent<({ options, onChange }: Props$5) => React$1.JSX.Element>;

type Props$4 = Partial<Omit<UnstableColorFieldProps, 'value' | 'onChange'>> & {
    propTypeUtil?: PropTypeUtil<string, string>;
    anchorEl?: HTMLElement | null;
};
declare const ColorControl: ControlComponent<({ propTypeUtil, anchorEl, slotProps, ...props }: Props$4) => React$1.JSX.Element>;

type RenderContentProps = {
    size: ToggleButtonProps['size'];
};
type ToggleButtonGroupItem<TValue> = {
    value: TValue;
    label: string;
    renderContent: ({ size }: RenderContentProps) => React$1.ReactNode;
    showTooltip?: boolean;
};
type ExclusiveValue<TValue> = TValue;
type NonExclusiveValue<TValue> = TValue[];
type Props$3<TValue> = {
    disabled?: boolean;
    justify?: StackProps['justifyContent'];
    size?: ToggleButtonProps['size'];
    items: ToggleButtonGroupItem<TValue | null>[];
    maxItems?: number;
    fullWidth?: boolean;
} & ({
    exclusive?: false;
    value: NonExclusiveValue<TValue>;
    onChange: (value: NonExclusiveValue<TValue>) => void;
} | {
    exclusive: true;
    value: ExclusiveValue<TValue>;
    onChange: (value: ExclusiveValue<TValue>) => void;
});
declare const ControlToggleButtonGroup: <TValue>({ justify, size, value, onChange, items, maxItems, exclusive, fullWidth, disabled, }: Props$3<TValue>) => React$1.JSX.Element;

type ToggleControlProps<T extends PropValue> = {
    options: Array<ToggleButtonGroupItem<T> & {
        exclusive?: boolean;
    }>;
    fullWidth?: boolean;
    size?: ToggleButtonProps['size'];
    exclusive?: boolean;
    maxItems?: number;
};
declare const ToggleControl: ControlComponent<({ options, fullWidth, size, exclusive, maxItems, }: ToggleControlProps<StringPropValue["value"]>) => React$1.JSX.Element>;

declare const NumberControl: ControlComponent<({ placeholder: labelPlaceholder, max, min, step, shouldForceInt, }: {
    placeholder?: string;
    max?: number;
    min?: number;
    step?: number;
    shouldForceInt?: boolean;
}) => React$1.JSX.Element>;

type MultiSizePropValue = Record<PropKey, SizePropValue>;
type Item = {
    icon: ReactNode;
    label: string;
    bind: PropKey;
};
type EqualUnequalItems = [Item, Item, Item, Item];
type Props$2<TMultiPropType extends string, TPropValue extends MultiSizePropValue> = {
    label: string;
    icon: ReactNode;
    tooltipLabel: string;
    items: EqualUnequalItems;
    multiSizePropTypeUtil: PropTypeUtil<TMultiPropType, TPropValue>;
};
declare function EqualUnequalSizesControl<TMultiPropType extends string, TPropValue extends MultiSizePropValue>({ label, icon, tooltipLabel, items, multiSizePropTypeUtil, }: Props$2<TMultiPropType, TPropValue>): React$1.JSX.Element;

declare const LinkedDimensionsControl: ControlComponent<({ label, isSiteRtl, extendedOptions, }: {
    label: string;
    isSiteRtl?: boolean;
    extendedOptions?: ExtendedOption[];
}) => React$1.JSX.Element>;

type FontCategory = {
    label: string;
    fonts: string[];
};
type FontFamilyControlProps = {
    fontFamilies: FontCategory[];
    sectionWidth: number;
};
declare const FontFamilyControl: ControlComponent<({ fontFamilies, sectionWidth }: FontFamilyControlProps) => React$1.JSX.Element>;

declare const UrlControl: ControlComponent<({ placeholder }: {
    placeholder?: string;
}) => React$1.JSX.Element>;

type ControlProps<TControlProps = unknown> = TControlProps & {
    context: {
        elementId: string;
    };
};

type Props$1 = ControlProps<{
    queryOptions: {
        requestParams: Record<string, unknown>;
        endpoint: string;
    };
    allowCustomValues?: boolean;
    minInputLength?: number;
    placeholder?: string;
    label?: string;
}>;
declare const LinkControl: ControlComponent<(props: Props$1) => React$1.JSX.Element>;

declare const GapControl: ControlComponent<({ label }: {
    label: string;
}) => React$1.JSX.Element>;

declare const AspectRatioControl: ControlComponent<({ label }: {
    label: string;
}) => React$1.JSX.Element>;

declare const SvgMediaControl: ControlComponent<() => React$1.JSX.Element>;

declare const BackgroundControl: ControlComponent<() => React$1.JSX.Element>;

declare const SwitchControl: ControlComponent<() => React$1.JSX.Element>;

type ChildControlConfig = {
    component: React.ComponentType;
    props?: Record<string, unknown>;
    propTypeUtil: PropTypeUtil<string, any>;
    label?: string;
};

type RepeatableControlProps = {
    label: string;
    repeaterLabel: string;
    childControlConfig: ChildControlConfig;
    showDuplicate?: boolean;
    showToggle?: boolean;
    initialValues?: object;
    patternLabel?: string;
    placeholder?: string;
};
declare const RepeatableControl: ControlComponent<({ repeaterLabel, childControlConfig, showDuplicate, showToggle, initialValues, patternLabel, placeholder, }: RepeatableControlProps) => React$1.JSX.Element | null>;

type KeyValueControlProps = {
    keyName?: string;
    valueName?: string;
    regexKey?: string;
    regexValue?: string;
    validationErrorMessage?: string;
};
declare const KeyValueControl: ControlComponent<(props?: KeyValueControlProps) => React$1.JSX.Element>;

declare const PositionControl: () => React$1.JSX.Element;

declare const PopoverContent: FC<PropsWithChildren<StackProps>>;

declare const ControlFormLabel: (props: FormLabelProps) => React$1.JSX.Element;

type FontFamilySelectorProps = {
    fontFamilies: FontCategory[];
    fontFamily: string | null;
    onFontFamilyChange: (fontFamily: string) => void;
    onClose: () => void;
    sectionWidth: number;
};
declare const FontFamilySelector: ({ fontFamilies, fontFamily, onFontFamilyChange, onClose, sectionWidth, }: FontFamilySelectorProps) => React$1.JSX.Element;

type AnyComponentType = ComponentType<any>;
declare const brandSymbol: unique symbol;
type ControlComponent<TComponent extends AnyComponentType = AnyComponentType> = TComponent & {
    [brandSymbol]: true;
};

type ControlActionsItems = Array<{
    id: string;
    MenuItem: React$1.ComponentType;
}>;
type ControlActionsContext = {
    items: ControlActionsItems;
};
type ControlActionsProviderProps = PropsWithChildren<ControlActionsContext>;
declare const ControlActionsProvider: ({ children, items }: ControlActionsProviderProps) => React$1.JSX.Element;
declare const useControlActions: () => ControlActionsContext;

type SetValueMeta = {
    bind?: PropKey;
};
type SetValue<T> = (value: T, options?: CreateOptions, meta?: SetValueMeta) => void;
type PropContext<T extends PropValue, P extends PropType> = {
    setValue: SetValue<T>;
    value: T | null;
    propType: P;
    placeholder?: T;
    isDisabled?: (propType: PropType) => boolean | undefined;
};
declare const PropContext: React$1.Context<PropContext<PropValue, PropType> | null>;
type PropProviderProps<T extends PropValue, P extends PropType> = React$1.PropsWithChildren<PropContext<T, P>>;
declare const PropProvider: <T extends PropValue, P extends PropType>({ children, value, setValue, propType, placeholder, isDisabled, }: PropProviderProps<T, P>) => React$1.JSX.Element;

type PropKeyContextValue<T, P> = {
    bind: PropKey;
    setValue: SetValue<T>;
    value: T;
    propType: P;
    placeholder?: T;
    path: PropKey[];
    isDisabled?: (propType: PropType) => boolean | undefined;
    disabled?: boolean;
};
type PropKeyProviderProps = React$1.PropsWithChildren<{
    bind: PropKey;
}>;
declare const PropKeyProvider: ({ children, bind }: PropKeyProviderProps) => React$1.JSX.Element;

type UseBoundProp<TValue extends PropValue> = {
    bind: PropKey;
    setValue: SetValue<TValue | null>;
    value: TValue;
    propType: PropType;
    placeholder?: TValue;
    path: PropKey[];
    restoreValue: () => void;
    isDisabled?: (propType: PropType) => boolean | undefined;
    disabled?: boolean;
};
declare function useBoundProp<T extends PropValue = PropValue, P extends PropType = PropType>(): PropKeyContextValue<T, P>;
declare function useBoundProp<TKey extends string, TValue extends PropValue>(propTypeUtil: PropTypeUtil<TKey, TValue>): UseBoundProp<TValue>;

type ControlReplacement = {
    component: ComponentType;
    condition: ({ value }: ConditionArgs) => boolean;
};
type ConditionArgs = {
    value: PropValue;
};
type Props = PropsWithChildren<{
    replacements: ControlReplacement[];
}>;
declare const ControlReplacementsProvider: ({ replacements, children }: Props) => React$1.JSX.Element;
declare const createControlReplacementsRegistry: () => {
    registerControlReplacement: (replacement: ControlReplacement) => void;
    getControlReplacements: () => ControlReplacement[];
};

type ControlAdornmentsItems = Array<{
    id: string;
    Adornment: ComponentType;
}>;
type ControlAdornmentsContext = {
    items?: ControlAdornmentsItems;
};
type ControlAdornmentsProviderProps = PropsWithChildren<ControlAdornmentsContext>;
declare const ControlAdornmentsProvider: ({ children, items }: ControlAdornmentsProviderProps) => React$1.JSX.Element;

declare function ControlAdornments(): React$1.JSX.Element | null;

declare const injectIntoRepeaterItemIcon: (args: _elementor_locations.ReplaceableInjectArgs<{
    value: PropValue;
}>) => void;
declare const injectIntoRepeaterItemLabel: (args: _elementor_locations.ReplaceableInjectArgs<{
    value: PropValue;
}>) => void;

type UseInternalStateOptions<TValue> = {
    external: TValue | null;
    setExternal: (value: TValue | null) => void;
    persistWhen: (value: TValue | null) => boolean;
    fallback: (value: TValue | null) => TValue;
};
declare const useSyncExternalState: <TValue>({ external, setExternal, persistWhen, fallback, }: UseInternalStateOptions<TValue>) => readonly [TValue, (setter: ((value: TValue) => TValue) | TValue) => void];

export { AspectRatioControl, BackgroundControl, BoxShadowRepeaterControl, ColorControl, type ControlActionsItems, ControlActionsProvider, ControlAdornments, ControlAdornmentsProvider, type ControlComponent, ControlFormLabel, ControlReplacementsProvider, ControlToggleButtonGroup, type EqualUnequalItems, EqualUnequalSizesControl, type ExtendedOption, FilterRepeaterControl, type FontCategory, FontFamilyControl, FontFamilySelector, GapControl, ImageControl, KeyValueControl, LinkControl, LinkedDimensionsControl, NumberControl, PopoverContent, PositionControl, PropKeyProvider, PropProvider, type PropProviderProps, RepeatableControl, SelectControl, type SetValue, SizeControl, StrokeControl, SvgMediaControl, SwitchControl, TextAreaControl, TextControl, type ToggleButtonGroupItem, ToggleControl, type ToggleControlProps, type Unit, UrlControl, createControlReplacementsRegistry, injectIntoRepeaterItemIcon, injectIntoRepeaterItemLabel, useBoundProp, useControlActions, useSyncExternalState };
