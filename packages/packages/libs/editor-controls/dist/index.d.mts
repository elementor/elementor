import {
	type ComponentProps,
	type ComponentType,
	type Dispatch,
	type FC,
	type PropsWithChildren,
	type ReactNode,
	type RefObject,
	type SetStateAction,
} from 'react';
import type * as React$1 from 'react';
import { type ElementID } from '@elementor/editor-elements';
import {
	type CreateOptions,
	type LinkPropValue,
	type PropKey,
	type PropType,
	type PropTypeUtil,
	type PropValue,
	type SizePropValue,
	type StringPropValue,
	type TransformablePropValue,
} from '@elementor/editor-props';
import { type StyleDefinitionState } from '@elementor/editor-styles';
import type * as _elementor_locations from '@elementor/locations';
import {
	type FormLabelProps,
	type Grid,
	type PopupState,
	type SelectProps,
	type StackProps,
	type SxProps,
	type TextFieldProps,
	type Theme,
	type ToggleButtonProps,
	type UnstableColorFieldProps,
} from '@elementor/ui';
import type * as _mui_material from '@mui/material';
import { type EditorProps, type EditorView } from '@tiptap/pm/view';
import { type Editor } from '@tiptap/react';

type ImageControlProps = {
	sizes: {
		label: string;
		value: string;
	}[];
	label?: string;
};
declare const ImageControl: ControlComponent$1<({ sizes, label }: ImageControlProps) => React$1.JSX.Element>;

declare const TextControl: ControlComponent$1<
	({
		placeholder,
		error,
		inputValue,
		inputDisabled,
		helperText,
		sx,
		ariaLabel,
	}: {
		placeholder?: string;
		error?: boolean;
		inputValue?: string;
		inputDisabled?: boolean;
		helperText?: string;
		sx?: SxProps;
		ariaLabel?: string;
	}) => React$1.JSX.Element
>;

type Props$9 = {
	placeholder?: string;
	ariaLabel?: string;
};
declare const TextAreaControl: ControlComponent$1<({ placeholder, ariaLabel }: Props$9) => React$1.JSX.Element>;

declare const lengthUnits: readonly ['px', '%', 'em', 'rem', 'vw', 'vh', 'ch'];
declare const angleUnits: readonly ['deg', 'rad', 'grad', 'turn'];
declare const timeUnits: readonly ['s', 'ms'];
declare const defaultExtendedOptions: readonly ['auto', 'custom'];
type LengthUnit = (typeof lengthUnits)[number];
type AngleUnit = (typeof angleUnits)[number];
type TimeUnit = (typeof timeUnits)[number];
type ExtendedOption = (typeof defaultExtendedOptions)[number];
type Unit = LengthUnit | AngleUnit | TimeUnit;
declare function isUnitExtendedOption(unit: Unit | ExtendedOption): unit is ExtendedOption;

type SizeVariant = 'length' | 'angle' | 'time';
type UnitProps<T extends readonly Unit[]> = {
	units?: T;
	defaultUnit?: T[number];
};
type BaseSizeControlProps = {
	placeholder?: string;
	startIcon?: React$1.ReactNode;
	extendedOptions?: ExtendedOption[];
	disableCustom?: boolean;
	anchorRef?: RefObject<HTMLDivElement | null>;
	min?: number;
	enablePropTypeUnits?: boolean;
	id?: string;
	ariaLabel?: string;
};
type LengthSizeControlProps = BaseSizeControlProps &
	UnitProps<LengthUnit[]> & {
		variant: 'length';
	};
type AngleSizeControlProps = BaseSizeControlProps &
	UnitProps<AngleUnit[]> & {
		variant: 'angle';
	};
type TimeSizeControlProps = BaseSizeControlProps &
	UnitProps<TimeUnit[]> & {
		variant: 'time';
	};
type SizeControlProps = LengthSizeControlProps | AngleSizeControlProps | TimeSizeControlProps;
declare const SizeControl: ControlComponent$1<
	({
		variant,
		defaultUnit,
		units,
		placeholder,
		startIcon,
		anchorRef,
		extendedOptions,
		disableCustom,
		min,
		enablePropTypeUnits,
		id,
		ariaLabel,
	}: Omit<SizeControlProps, 'variant'> & {
		variant?: SizeVariant;
	}) => React$1.JSX.Element
>;

declare const StrokeControl: ControlComponent$1<() => React$1.JSX.Element>;

declare const BoxShadowRepeaterControl: ControlComponent$1<() => React$1.JSX.Element>;

type FilterPropName = {
	filterPropName?: 'filter' | 'backdrop-filter';
};
declare const FilterRepeaterControl: ControlComponent$1<({ filterPropName }: FilterPropName) => React$1.JSX.Element>;

type SelectOption$1 = {
	label: string;
	value: StringPropValue['value'];
	disabled?: boolean;
};
type SelectControlProps = {
	options: SelectOption$1[];
	onChange?: (newValue: string | null, previousValue: string | null | undefined) => void;
	MenuProps?: SelectProps['MenuProps'];
	ariaLabel?: string;
};
declare const SelectControl: ControlComponent$1<
	({ options, onChange, MenuProps, ariaLabel }: SelectControlProps) => React$1.JSX.Element
>;

declare const collectionMethods: {
	readonly 'off-canvas': () => SelectOption$1[];
};
type SelectControlWrapperProps = Parameters<typeof SelectControl>[0] & {
	collectionId?: keyof typeof collectionMethods;
};
declare const SelectControlWrapper: ControlComponent$1<
	({ collectionId, options, ...props }: SelectControlWrapperProps) => React$1.JSX.Element
>;

type ChipsOption = {
	label: string;
	value: string;
};
type ChipsControlProps = {
	options: ChipsOption[];
};
declare const ChipsControl: ControlComponent$1<({ options }: ChipsControlProps) => React$1.JSX.Element>;

type Props$8 = Partial<Omit<UnstableColorFieldProps, 'value' | 'onChange'>> & {
	propTypeUtil?: PropTypeUtil<string, string>;
	anchorEl?: HTMLElement | null;
	id?: string;
};
declare const ColorControl: ControlComponent$1<
	({ propTypeUtil, anchorEl, slotProps, id, ...props }: Props$8) => React$1.JSX.Element
>;

type RenderContentProps = {
	size: ToggleButtonProps['size'];
};
type ToggleButtonGroupItem<TValue> = {
	value: TValue;
	disabled?: boolean;
	label: string;
	renderContent: ({ size }: RenderContentProps) => React$1.ReactNode;
	showTooltip?: boolean;
};
type ExclusiveValue<TValue> = TValue;
type NonExclusiveValue<TValue> = TValue[];
type Props$7<TValue> = {
	disabled?: boolean;
	justify?: StackProps['justifyContent'];
	size?: ToggleButtonProps['size'];
	items: ToggleButtonGroupItem<TValue | null>[];
	maxItems?: number;
	fullWidth?: boolean;
	placeholder?: TValue | TValue[];
} & (
	| {
			exclusive?: false;
			value: NonExclusiveValue<TValue>;
			onChange: (value: NonExclusiveValue<TValue>) => void;
	  }
	| {
			exclusive: true;
			value: ExclusiveValue<TValue>;
			onChange: (value: ExclusiveValue<TValue>) => void;
	  }
);
declare const ToggleButtonGroupUi: <TValue>(
	props: Props$7<TValue> & {
		ref?: React$1.Ref<HTMLDivElement>;
	}
) => React$1.ReactElement;
declare const ControlToggleButtonGroup: <TValue>(props: Props$7<TValue>) => React$1.JSX.Element;

type ToggleControlProps<T extends PropValue> = {
	options: Array<
		ToggleButtonGroupItem<T> & {
			exclusive?: boolean;
		}
	>;
	fullWidth?: boolean;
	size?: ToggleButtonProps['size'];
	exclusive?: boolean;
	maxItems?: number;
	convertOptions?: boolean;
};
declare const ToggleControl: ControlComponent$1<
	({
		options,
		fullWidth,
		size,
		exclusive,
		maxItems,
		convertOptions,
	}: ToggleControlProps<StringPropValue['value']>) => React$1.JSX.Element
>;

declare const NumberControl: ControlComponent$1<
	({
		placeholder: labelPlaceholder,
		max,
		min,
		step,
		shouldForceInt,
		startIcon,
	}: {
		placeholder?: string;
		max?: number;
		min?: number;
		step?: number;
		shouldForceInt?: boolean;
		startIcon?: React$1.ReactNode;
	}) => React$1.JSX.Element
>;

type MultiSizePropValue = Record<PropKey, PropValue>;
type Item$1 = {
	icon: ReactNode;
	label: string;
	ariaLabel?: string;
	bind: PropKey;
};
type EqualUnequalItems = [Item$1, Item$1, Item$1, Item$1];
type Props$6<TMultiPropType extends string, TPropValue extends MultiSizePropValue> = {
	label: string;
	icon: ReactNode;
	tooltipLabel: string;
	items: EqualUnequalItems;
	multiSizePropTypeUtil: PropTypeUtil<TMultiPropType, TPropValue>;
};
declare function EqualUnequalSizesControl<TMultiPropType extends string, TPropValue extends MultiSizePropValue>({
	label,
	icon,
	tooltipLabel,
	items,
	multiSizePropTypeUtil,
}: Props$6<TMultiPropType, TPropValue>): React$1.JSX.Element;

type Props$5 = {
	label: string;
	isSiteRtl?: boolean;
	extendedOptions?: ExtendedOption[];
	min?: number;
};
declare const LinkedDimensionsControl: ({ label, isSiteRtl, extendedOptions, min }: Props$5) => React$1.JSX.Element;

type FontCategory = {
	label: string;
	fonts: string[];
};
type FontFamilyControlProps = {
	fontFamilies: FontCategory[];
	sectionWidth: number;
	ariaLabel?: string;
};
declare const FontFamilyControl: ControlComponent$1<
	({ fontFamilies, sectionWidth, ariaLabel }: FontFamilyControlProps) => React$1.JSX.Element
>;

type SelectableItem = {
	type: 'item' | 'category';
	value: string;
	disabled?: boolean;
};

type Category = {
	label: string;
	items: string[];
};
type ItemSelectorProps = {
	itemsList: Category[];
	selectedItem: string | null;
	onItemChange: (item: string) => void;
	onClose: () => void;
	sectionWidth: number;
	title: string;
	itemStyle?: (item: SelectableItem) => React$1.CSSProperties;
	onDebounce?: (name: string) => void;
	icon: React$1.ElementType<{
		fontSize: string;
	}>;
	disabledItems?: string[];
	id?: string;
	footer?: ReactNode;
	categoryItemContentTemplate?: (item: SelectableItem) => ReactNode;
};
declare const ItemSelector: ({
	itemsList,
	selectedItem,
	onItemChange,
	onClose,
	sectionWidth,
	title,
	itemStyle,
	onDebounce,
	icon,
	disabledItems,
	id,
	footer,
	categoryItemContentTemplate,
}: ItemSelectorProps) => React$1.JSX.Element;

declare const UrlControl: ControlComponent$1<
	({ placeholder, ariaLabel }: { placeholder?: string; ariaLabel?: string }) => React$1.JSX.Element
>;

type ControlProps<TControlProps = unknown> = TControlProps & {
	context: {
		elementId: string;
	};
};

type Props$4 = ControlProps<{
	queryOptions: {
		params: Record<string, unknown>;
		url: string;
	};
	allowCustomValues?: boolean;
	minInputLength?: number;
	placeholder?: string;
	label?: string;
	ariaLabel?: string;
}>;
type DestinationProp = LinkPropValue['value']['destination'];
declare const LinkControl: ControlComponent$1<(props: Props$4) => React$1.JSX.Element>;

type SelectOption = {
	label: string;
	value: StringPropValue['value'];
	disabled?: boolean;
};
type Props$3 = {
	options: SelectOption[];
	onChange?: (newValue: string | null, previousValue: string | null | undefined) => void;
	fallbackLabels?: Record<string, string>;
};
declare const HtmlTagControl: ControlComponent$1<
	({ options, onChange, fallbackLabels }: Props$3) => React$1.JSX.Element
>;

type Props$2 = {
	queryOptions: {
		params: Record<string, unknown>;
		url: string;
	};
	allowCustomValues?: boolean;
	minInputLength?: number;
	placeholder?: string;
	onSetValue?: (value: DestinationProp | null) => void;
	ariaLabel?: string;
};
declare const QueryControl: ControlComponent$1<(props: Props$2) => React$1.JSX.Element>;

declare const GapControl: ({ label }: { label: string }) => React$1.JSX.Element;

declare const AspectRatioControl: ControlComponent$1<({ label }: { label: string }) => React$1.JSX.Element>;

declare const SvgMediaControl: ControlComponent$1<() => React$1.JSX.Element>;

declare const VideoMediaControl: ControlComponent$1<() => React$1.JSX.Element>;

declare const BackgroundControl: ControlComponent$1<() => React$1.JSX.Element>;

declare const SwitchControl: ControlComponent$1<() => React$1.JSX.Element>;

type TooltipAddItemActionProps = {
	disabled?: boolean;
	enableTooltip?: boolean;
	tooltipContent?: React$1.ReactNode;
	newItemIndex?: number;
	ariaLabel?: string;
};

type Item<T> = {
	disabled?: boolean;
} & T;
type RepeatablePropValue = TransformablePropValue<PropKey, PropValue>;

type ChildControlConfig = {
	component: React.ComponentType;
	props?: Record<string, unknown>;
	propTypeUtil: PropTypeUtil<string, any>;
	label?: string;
	isItemDisabled?: (item: Item<RepeatablePropValue>) => boolean;
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
	propKey?: string;
	addItemTooltipProps?: TooltipAddItemActionProps;
};
declare const RepeatableControl: ControlComponent$1<
	({
		repeaterLabel,
		childControlConfig,
		showDuplicate,
		showToggle,
		initialValues,
		patternLabel,
		placeholder,
		propKey,
		addItemTooltipProps,
	}: RepeatableControlProps) => React$1.JSX.Element | null
>;

type KeyValueControlProps = {
	keyName?: string;
	valueName?: string;
	regexKey?: string;
	regexValue?: string;
	validationErrorMessage?: string;
	escapeHtml?: boolean;
	getHelperText?: (
		key: string,
		value: string
	) => {
		keyHelper?: string;
		valueHelper?: string;
	};
};
declare const KeyValueControl: ControlComponent$1<(props?: KeyValueControlProps) => React$1.JSX.Element>;

declare const PositionControl: () => React$1.JSX.Element;

declare const TransformRepeaterControl: ControlComponent$1<
	({ showChildrenPerspective }: { showChildrenPerspective: boolean }) => React$1.JSX.Element
>;

declare const TransformSettingsControl: ({
	popupState,
	anchorRef,
	showChildrenPerspective,
}: {
	popupState: PopupState;
	anchorRef: React$1.RefObject<HTMLDivElement | null>;
	showChildrenPerspective: boolean;
}) => React$1.JSX.Element;

declare const TransitionRepeaterControl: ControlComponent$1<
	({
		recentlyUsedListGetter,
		currentStyleState,
	}: {
		recentlyUsedListGetter: () => Promise<string[]>;
		currentStyleState: StyleDefinitionState;
	}) => React$1.JSX.Element
>;

declare const PopoverContent: FC<PropsWithChildren<StackProps>>;

type EnqueueFont = (fontFamily: string, context?: 'preview' | 'editor') => void;
declare const enqueueFont: EnqueueFont;

type TransitionProperty = {
	label: string;
	value: string;
	unavailable?: boolean;
	isDisabled?: boolean;
};
type TransitionCategory = {
	label: string;
	type: 'category';
	properties: TransitionProperty[];
};
declare const transitionProperties: TransitionCategory[];
declare const transitionsItemsList: {
	label: string;
	items: string[];
}[];

declare const DateTimeControl: ControlComponent$1<
	({ inputDisabled }: { inputDisabled?: boolean }) => React$1.JSX.Element
>;

declare const InlineEditingControl: ControlComponent$1<
	({
		sx,
		attributes,
		props,
	}: {
		sx?: SxProps<Theme>;
		attributes?: Record<string, string>;
		props?: ComponentProps<'div'>;
	}) => React$1.JSX.Element
>;

declare const EmailFormActionControl: ControlComponent$1<() => React$1.JSX.Element>;

declare const ControlFormLabel: (props: FormLabelProps) => React$1.JSX.Element;

declare const DisplayConditionsControl: ControlComponent$1<() => React$1.JSX.Element>;

declare const AttributesControl: ControlComponent$1<() => React$1.JSX.Element>;

type V4PromotionData = {
	title: string;
	content: string;
	image: string;
	ctaUrl: string;
};
type V4PromotionKey = 'displayConditions' | 'customCss' | 'attributes';

type PromotionTriggerProps = {
	promotionKey: V4PromotionKey;
	children?: ReactNode;
};
type PromotionTriggerRef = {
	toggle: () => void;
};
declare const PromotionTrigger: React$1.ForwardRefExoticComponent<
	PromotionTriggerProps & React$1.RefAttributes<PromotionTriggerRef>
>;

type ClearIconButtonProps = {
	onClick?: () => void;
	tooltipText: React$1.ReactNode;
	disabled?: boolean;
	size?: 'tiny' | 'small' | 'medium' | 'large';
};
declare const ClearIconButton: ({ tooltipText, onClick, disabled, size }: ClearIconButtonProps) => React$1.JSX.Element;

type Action = {
	type: string;
	payload?: object;
};
type SetValueMeta<TAction = Action> = {
	bind?: PropKey;
	validation?: (value: PropValue) => boolean;
	action?: TAction;
	withHistory?: boolean;
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
declare const PropProvider: <T extends PropValue, P extends PropType>({
	children,
	value,
	setValue,
	propType,
	placeholder,
	isDisabled,
}: PropProviderProps<T, P>) => React$1.JSX.Element;

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
	resetValue: () => void;
	isDisabled?: (propType: PropType) => boolean | undefined;
	disabled?: boolean;
};
type EnhancedPropKeyContextValue<T, P> = PropKeyContextValue<T, P> & {
	resetValue: () => void;
};
declare function useBoundProp<
	T extends PropValue = PropValue,
	P extends PropType = PropType,
>(): EnhancedPropKeyContextValue<T, P>;
declare function useBoundProp<TKey extends string, TValue extends PropValue>(
	propTypeUtil: PropTypeUtil<TKey, TValue>
): UseBoundProp<TValue>;

type AnchorEl = HTMLElement | null;
type RepeaterItem<T> = {
	disabled?: boolean;
} & T;
type RepeaterItemContentProps<T> = {
	anchorEl: AnchorEl;
	bind: PropKey;
	value: T;
	index: number;
};
type RepeaterItemContent<T> = React$1.ComponentType<RepeaterItemContentProps<T>>;
type ItemsActionPayload<T> = Array<{
	index: number;
	item: T;
}>;
type AddItemMeta<T> = {
	type: 'add';
	payload: ItemsActionPayload<T>;
};
type RemoveItemMeta<T> = {
	type: 'remove';
	payload: ItemsActionPayload<T>;
};
type DuplicateItemMeta<T> = {
	type: 'duplicate';
	payload: ItemsActionPayload<T>;
};
type ReorderItemMeta = {
	type: 'reorder';
	payload: {
		from: number;
		to: number;
	};
};
type ToggleDisableItemMeta = {
	type: 'toggle-disable';
};
type SetRepeaterValuesMeta<T> =
	| SetValueMeta<AddItemMeta<T>>
	| SetValueMeta<RemoveItemMeta<T>>
	| SetValueMeta<DuplicateItemMeta<T>>
	| SetValueMeta<ReorderItemMeta>
	| SetValueMeta<ToggleDisableItemMeta>;
type BaseItemSettings<T> = {
	initialValues: T;
	Label: React$1.ComponentType<{
		value: T;
		index: number;
	}>;
	Icon: React$1.ComponentType<{
		value: T;
	}>;
	Content: RepeaterItemContent<T>;
	actions?: (value: T) => React$1.ReactNode;
};
type SortableItemSettings<T> = BaseItemSettings<T> & {
	getId: ({ item, index }: { item: T; index: number }) => string;
};
type RepeaterProps<T> =
	| {
			label: string;
			values?: T[];
			openOnAdd?: boolean;
			setValues: (newValue: T[], _: CreateOptions, meta?: SetRepeaterValuesMeta<T>) => void;
			disabled?: boolean;
			disableAddItemButton?: boolean;
			addButtonInfotipContent?: React$1.ReactNode;
			showDuplicate?: boolean;
			showToggle?: boolean;
			showRemove?: boolean;
			openItem?: number;
			isSortable: false;
			itemSettings: BaseItemSettings<T>;
	  }
	| {
			label: string;
			values?: T[];
			openOnAdd?: boolean;
			setValues: (newValue: T[], _: CreateOptions, meta?: SetRepeaterValuesMeta<T>) => void;
			disabled?: boolean;
			disableAddItemButton?: boolean;
			addButtonInfotipContent?: React$1.ReactNode;
			showDuplicate?: boolean;
			showToggle?: boolean;
			showRemove?: boolean;
			openItem?: number;
			isSortable?: true;
			itemSettings: SortableItemSettings<T>;
	  };
declare const Repeater: <T>({
	label,
	itemSettings,
	disabled,
	openOnAdd,
	values: items,
	setValues: setItems,
	showDuplicate,
	showToggle,
	showRemove,
	disableAddItemButton,
	addButtonInfotipContent,
	openItem: initialOpenItem,
	isSortable,
}: RepeaterProps<RepeaterItem<T>>) => React$1.JSX.Element;

declare const PopoverGridContainer: React$1.ForwardRefExoticComponent<
	{
		gap?: number;
		alignItems?: React$1.ComponentProps<typeof Grid>['alignItems'];
		flexWrap?: React$1.ComponentProps<typeof Grid>['flexWrap'];
	} & {
		children?: React$1.ReactNode | undefined;
	} & React$1.RefAttributes<unknown>
>;

type InlineEditorProps = {
	value: string | null;
	setValue: (value: string | null) => void;
	editorProps?: EditorProps;
	elementClasses?: string;
	sx?: SxProps<Theme>;
	onBlur?: () => void;
	autofocus?: boolean;
	expectedTag?: string | null;
	onEditorCreate?: Dispatch<SetStateAction<Editor | null>>;
	wrapperClassName?: string;
	onSelectionEnd?: (view: EditorView) => void;
};
declare const InlineEditor: React$1.ForwardRefExoticComponent<InlineEditorProps & React$1.RefAttributes<unknown>>;

type InlineEditorToolbarProps = {
	editor: Editor;
	elementId?: ElementID;
	sx?: SxProps<Theme>;
};
declare const InlineEditorToolbar: ({ editor, elementId, sx }: InlineEditorToolbarProps) => React$1.JSX.Element;

type Props$1<TValue> = {
	value: TValue;
	units: Unit[];
	defaultUnit?: Unit;
	onChange: (value: TValue) => void;
	onBlur?: (event: React$1.FocusEvent<HTMLInputElement>) => void;
	disabled?: boolean;
	InputProps?: TextFieldProps['InputProps'];
	startIcon?: React$1.ReactNode;
};
declare const UnstableSizeField: <T extends SizePropValue['value']>({
	value,
	InputProps,
	onChange,
	onBlur,
	units,
	defaultUnit,
	startIcon,
}: Props$1<T>) => React$1.JSX.Element;

declare const NumberInput: React$1.ForwardRefExoticComponent<
	(
		| Omit<_mui_material.FilledTextFieldProps, 'ref'>
		| Omit<_mui_material.OutlinedTextFieldProps, 'ref'>
		| Omit<_mui_material.StandardTextFieldProps, 'ref'>
	) &
		React$1.RefAttributes<unknown>
>;

type AnyComponentType = ComponentType<any>;
declare const brandSymbol: unique symbol;
type ControlComponent$1<TComponent extends AnyComponentType = AnyComponentType> = TComponent & {
	[brandSymbol]: true;
};
declare function createControl<T extends AnyComponentType>(Control: T): ControlComponent$1<T>;

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

type AdornmentComponent = ComponentType<{
	customContext?: {
		path: string[];
		propType: PropType;
	};
}>;
type ControlAdornmentsItem = {
	id: string;
	Adornment: AdornmentComponent;
};
type ControlAdornmentsContext = {
	items?: ControlAdornmentsItem[];
};
type ControlAdornmentsProviderProps = PropsWithChildren<ControlAdornmentsContext>;
declare const ControlAdornmentsProvider: ({ children, items }: ControlAdornmentsProviderProps) => React$1.JSX.Element;

type ControlComponent = ComponentType<
	object & {
		OriginalControl: ComponentType;
	}
>;
type ControlReplacement = {
	id?: string;
	component: ControlComponent;
	condition: ({ value }: ConditionArgs) => boolean;
};
type ConditionArgs = {
	value: PropValue;
	placeholder?: PropValue;
};
type Props = PropsWithChildren<{
	replacements: ControlReplacement[];
}>;
declare const ControlReplacementsProvider: ({ replacements, children }: Props) => React$1.JSX.Element;
declare const useControlReplacement: (OriginalComponent: ControlComponent) =>
	| {
			ControlToRender: ControlComponent;
			OriginalControl: ControlComponent;
			isReplaced: boolean;
	  }
	| {
			ControlToRender: ControlComponent;
			OriginalControl: ControlComponent;
			isReplaced?: undefined;
	  };
declare const createControlReplacementsRegistry: () => {
	registerControlReplacement: (replacement: ControlReplacement) => void;
	getControlReplacements: () => ControlReplacement[];
};
declare const registerControlReplacement: (replacement: ControlReplacement) => void;
declare const getControlReplacements: () => ControlReplacement[];

declare function ControlAdornments({
	customContext,
}: {
	customContext?: {
		path: string[];
		propType: PropType;
	};
}): React$1.JSX.Element | null;

declare const injectIntoRepeaterItemIcon: (
	args: _elementor_locations.ReplaceableInjectArgs<{
		value: PropValue;
	}>
) => void;
declare const injectIntoRepeaterItemLabel: (
	args: _elementor_locations.ReplaceableInjectArgs<{
		value: PropValue;
	}>
) => void;
declare const injectIntoRepeaterItemActions: (
	args: _elementor_locations.InjectArgs<{
		index: number;
	}>
) => void;

type UseInternalStateOptions<TValue> = {
	external: TValue | null;
	setExternal: (value: TValue | null, options?: CreateOptions, meta?: SetValueMeta) => void;
	persistWhen: (value: TValue | null) => boolean;
	fallback: (value: TValue | null) => TValue;
};
declare const useSyncExternalState: <TValue>({
	external,
	setExternal,
	persistWhen,
	fallback,
}: UseInternalStateOptions<TValue>) => readonly [
	TValue,
	(setter: ((value: TValue) => TValue) | TValue, options?: CreateOptions, meta?: SetValueMeta) => void,
];

declare const useFontFamilies: () => FontCategory[];

type UseTypingBufferOptions = {
	limit?: number;
	timeout?: number;
};
declare function useTypingBuffer(options?: UseTypingBufferOptions): {
	buffer: string;
	appendKey: (key: string) => string;
	startsWith: (haystack: string, needle: string) => boolean;
};

export {
	type AdornmentComponent,
	type AngleUnit,
	AspectRatioControl,
	AttributesControl,
	BackgroundControl,
	BoxShadowRepeaterControl,
	ChipsControl,
	ClearIconButton,
	ColorControl,
	type ControlActionsItems,
	ControlActionsProvider,
	ControlAdornments,
	ControlAdornmentsProvider,
	type ControlComponent$1 as ControlComponent,
	ControlFormLabel,
	type ControlReplacement,
	ControlReplacementsProvider,
	ControlToggleButtonGroup,
	DateTimeControl,
	DisplayConditionsControl,
	EmailFormActionControl,
	type EqualUnequalItems,
	EqualUnequalSizesControl,
	type ExtendedOption,
	FilterRepeaterControl,
	type FontCategory,
	FontFamilyControl,
	GapControl,
	HtmlTagControl,
	ImageControl,
	InlineEditingControl,
	InlineEditor,
	InlineEditorToolbar,
	type InlineEditorToolbarProps,
	ItemSelector,
	type ItemsActionPayload,
	KeyValueControl,
	type LengthUnit,
	LinkControl,
	LinkedDimensionsControl,
	NumberControl,
	NumberInput,
	PopoverContent,
	PopoverGridContainer,
	PositionControl,
	PromotionTrigger,
	type PromotionTriggerRef,
	PropKeyProvider,
	PropProvider,
	type PropProviderProps,
	QueryControl,
	RepeatableControl,
	Repeater,
	type RepeaterItem,
	SelectControl,
	SelectControlWrapper,
	type SetRepeaterValuesMeta,
	type SetValue,
	type SetValueMeta,
	SizeControl,
	StrokeControl,
	SvgMediaControl,
	SwitchControl,
	TextAreaControl,
	TextControl,
	type TimeUnit,
	type ToggleButtonGroupItem,
	ToggleButtonGroupUi,
	ToggleControl,
	type ToggleControlProps,
	TransformRepeaterControl,
	TransformSettingsControl,
	TransitionRepeaterControl,
	type Unit,
	UnstableSizeField,
	UrlControl,
	type UseTypingBufferOptions,
	type V4PromotionData,
	type V4PromotionKey,
	VideoMediaControl,
	createControl,
	createControlReplacementsRegistry,
	enqueueFont,
	getControlReplacements,
	injectIntoRepeaterItemActions,
	injectIntoRepeaterItemIcon,
	injectIntoRepeaterItemLabel,
	isUnitExtendedOption,
	registerControlReplacement,
	transitionProperties,
	transitionsItemsList,
	useBoundProp,
	useControlActions,
	useControlReplacement,
	useFontFamilies,
	useSyncExternalState,
	useTypingBuffer,
};
