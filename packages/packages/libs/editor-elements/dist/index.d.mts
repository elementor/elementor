import {
	type AnyTransformable,
	type LinkPropValue,
	type Props,
	type PropsSchema,
	type PropValue,
	type SizePropValue,
} from '@elementor/editor-props';
import {
	type ClassState,
	type StyleDefinition,
	type StyleDefinitionID,
	type StyleDefinitionVariant,
} from '@elementor/editor-styles';
import type * as _elementor_editor_v1_adapters from '@elementor/editor-v1-adapters';

type ElementID = string;
type Element = {
	id: ElementID;
	type: string;
};
type PseudoState = {
	name: string;
	value: string;
};
type ElementType = {
	key: string;
	controls: ControlItem[];
	propsSchema: PropsSchema;
	dependenciesPerTargetMapping?: Record<string, string[]>;
	styleStates?: ClassState[];
	pseudoStates?: PseudoState[];
	title: string;
};
type ControlsSection = {
	type: 'section';
	value: {
		description?: string;
		label: string;
		items: ControlItem[];
	};
};
type Control = {
	type: 'control';
	value: {
		bind: string;
		label?: string;
		description?: string;
		type: string;
		props: Record<string, unknown>;
		meta?: {
			layout?: ControlLayout;
			topDivider?: boolean;
		};
	};
};
type ElementControl = {
	type: 'element-control';
	value: {
		type: string;
		label?: string;
		props: Record<string, unknown>;
		meta?: {
			layout?: ControlLayout;
			topDivider?: boolean;
		};
	};
};
type ControlItem = ControlsSection | Control | ElementControl;
type ControlLayout = 'full' | 'two-columns' | 'custom';

type ExtendedWindow = Window & {
	elementor?: {
		selection?: {
			getElements: () => V1Element[];
		};
		widgetsCache?: Record<string, V1ElementConfig>;
		documents?: {
			getCurrent?: () =>
				| {
						container: V1Element;
				  }
				| undefined;
			getCurrentId?: () => number;
		};
		getContainer?: (id: string) => V1Element | undefined;
	};
	elementorCommon?: {
		helpers?: {
			getUniqueId?: () => string;
		};
	};
};
type V1Element = {
	id: string;
	model: V1Model$1<V1ElementModelProps>;
	settings: V1Model$1<V1ElementSettingsProps>;
	children?: V1Element[] & {
		findRecursive?: (predicate: (child: V1Element) => boolean) => V1Element | undefined;
		forEachRecursive?: (callback: (child: V1Element) => void) => V1Element[];
	};
	view?: {
		el?: HTMLElement;
		_index?: number;
		getDomElement?: () => {
			get?: (index: number) => HTMLElement | undefined;
		};
	};
	parent?: V1Element;
	lookup?: () => V1Element;
};
type StringPropValue = {
	$$type: 'string';
	value: string;
};
type NumberPropValue = {
	$$type: 'number';
	value: number;
};
type BooleanPropValue = {
	$$type: 'boolean';
	value: boolean;
};
type TimingConfigPropValue = {
	$$type: 'timing-config';
	value: {
		duration: SizePropValue;
		delay: SizePropValue;
	};
};
type ConfigPropValue = {
	$$type: 'config';
	value: {
		replay: BooleanPropValue;
		easing: StringPropValue;
		relativeTo: StringPropValue;
		start?: SizePropValue;
		end?: SizePropValue;
	};
};
type AnimationPresetPropValue = {
	$$type: 'animation-preset-props';
	value: {
		effect: StringPropValue;
		custom_effect?: PropValue;
		type: StringPropValue;
		direction: StringPropValue;
		timing_config: TimingConfigPropValue;
		config: ConfigPropValue;
	};
};
type ExcludedBreakpointsPropValue = {
	$$type: 'excluded-breakpoints';
	value: StringPropValue[];
};
type InteractionBreakpointsPropValue = {
	$$type: 'interaction-breakpoints';
	value: {
		excluded: ExcludedBreakpointsPropValue;
	};
};
type InteractionItemPropValue = {
	$$type: 'interaction-item';
	value: {
		interaction_id?: StringPropValue;
		trigger: StringPropValue;
		animation: AnimationPresetPropValue;
		breakpoints?: InteractionBreakpointsPropValue;
	};
};
type ElementInteractions = {
	version: number;
	items: InteractionItemPropValue[];
};
type V1ElementModelProps = {
	title?: string;
	isLocked?: boolean;
	widgetType?: string;
	elType: string;
	id: string;
	styles?: Record<StyleDefinitionID, StyleDefinition>;
	elements?: V1Model$1<V1ElementModelProps>[];
	settings?: V1ElementSettingsProps;
	editor_settings?: V1ElementEditorSettingsProps;
	interactions?: string | ElementInteractions;
	isGlobal?: boolean;
};
type V1ElementData = Omit<V1ElementModelProps, 'elements'> & {
	elements?: V1ElementData[];
};
type V1ElementEditorSettingsProps = {
	title?: string;
	initial_position?: number;
	component_uid?: string;
};
type V1ElementSettingsProps = Record<string, PropValue>;
type V1ElementConfig<T = object> = {
	icon?: string;
	title: string;
	widgetType?: string;
	elType?: string;
	controls: object;
	atomic?: boolean;
	atomic_controls?: ControlItem[];
	atomic_props_schema?: PropsSchema;
	dependencies_per_target_mapping?: Record<string, string[]>;
	twig_templates?: Record<string, string>;
	twig_main_template?: string;
	base_styles?: Record<string, StyleDefinition>;
	base_styles_dictionary?: Record<string, string>;
	atomic_style_states?: ClassState[];
	atomic_pseudo_states?: PseudoState[];
	show_in_panel?: boolean;
	meta?: {
		[key: string]: string | number | boolean | null | NonNullable<V1ElementConfig['meta']>;
	};
} & T;
type V1Model$1<T> = {
	get: <K extends keyof T>(key: K) => T[K];
	set: <K extends keyof T>(key: K, value: T[K]) => void;
	toJSON: (options?: { remove?: string[] }) => T;
	trigger?: (event: string, ...args: unknown[]) => void;
};

type ElementModel = {
	id: string;
	editorSettings: V1ElementEditorSettingsProps;
};
type ElementChildren = Record<string, ElementModel[]>;
declare function useElementChildren<T extends ElementChildren>(
	elementId: ElementID,
	childrenTypes: Record<string, string>
): T;

declare const useElementEditorSettings: (elementId: ElementID) => V1ElementEditorSettingsProps;

declare function useParentElement(elementId: string | null): any;

declare function useSelectedElement():
	| {
			element: Element;
			elementType: ElementType;
	  }
	| {
			element: null;
			elementType: null;
	  };

type UseSelectedElementSettingsResult<TValue> =
	| {
			element: Element;
			elementType: ElementType;
			settings: Record<string, TValue | null>;
	  }
	| {
			element: null;
			elementType: null;
			settings: null;
	  };
declare function useSelectedElementSettings<TValue = AnyTransformable>(): UseSelectedElementSettingsResult<TValue>;

type Options$4 = {
	useHistory?: boolean;
	at?: number;
	clone?: boolean;
};
type CreateElementParams = {
	container: V1Element;
	model?: Omit<V1ElementModelProps, 'settings' | 'id'> & {
		settings?: V1ElementSettingsProps;
		id?: string;
	};
	options?: Options$4;
};
declare function createElement({ container, model, options }: CreateElementParams): V1Element;

type CreateElementsParams = {
	elements: CreateElementParams[];
	title: string;
	subtitle?: string;
};
type CreatedElement = {
	container: V1Element;
	parentContainer: V1Element;
	model: V1ElementModelProps;
	options?: CreateElementParams['options'];
};
type CreatedElementsResult = {
	createdElements: CreatedElement[];
};

declare const createElements: ({ elements, title, subtitle }: CreateElementsParams) => CreatedElementsResult;

type Options$3 = {
	useHistory?: boolean;
	at?: number;
};
type DeleteElementParams = {
	container: V1Element;
	options?: Options$3;
};
declare function deleteElement({ container, options }: DeleteElementParams): Promise<void>;

type Options$2 = {
	useHistory?: boolean;
	at?: number;
	scrollIntoView: boolean;
};
type DropElementParams = {
	containerId: string;
	options?: Options$2;
	model?: Omit<V1ElementModelProps, 'settings' | 'id'> & {
		settings?: V1ElementSettingsProps;
		id?: string;
	};
};
declare function dropElement({ containerId, model, options }: DropElementParams): V1Element;

type Options$1 = {
	useHistory?: boolean;
	at?: number;
	clone?: boolean;
};
type DuplicateElementParams = {
	element: V1Element;
	options?: Options$1;
};
declare function duplicateElement({ element, options }: DuplicateElementParams): V1Element;

type DuplicateElementsParams = {
	elementIds: string[];
	title: string;
	subtitle?: string;
	onDuplicateElements?: () => void;
	onRestoreElements?: () => void;
};
type DuplicatedElement = {
	container: V1Element;
	parentContainer: V1Element;
	model: V1ElementModelProps;
	at?: number;
};
type DuplicatedElementsResult = {
	duplicatedElements: DuplicatedElement[];
};

declare const duplicateElements: ({
	elementIds,
	title,
	subtitle,
	onDuplicateElements,
	onRestoreElements,
}: DuplicateElementsParams) => DuplicatedElementsResult;

declare const generateElementId: () => string;

declare function getContainer(id: string): V1Element | null;
declare const selectElement: (elementId: string) => void;

declare function getCurrentDocumentContainer(): V1Element | null;

declare function getCurrentDocumentId(): number | null;

declare function getElementEditorSettings(elementId: ElementID): V1ElementEditorSettingsProps;

declare function getElementLabel(elementId?: ElementID): string;

declare const getElementSetting: <TValue>(elementId: ElementID, settingKey: string) => TValue | null;
declare const getElementSettings: <TValue>(elementId: ElementID, settingKey: string[]) => Record<string, TValue | null>;

declare const getElementStyles: (elementID: ElementID) => Record<string, StyleDefinition> | null;

declare function getElementType(type: string): ElementType | null;

declare function getAllDescendants(container: V1Element): V1Element[];

type V1Model = V1Element['model'];
type ModelResult = {
	model: V1Model;
};
declare function findChildRecursive(model: V1Model, predicate: (model: V1Model) => boolean): ModelResult | null;
declare function getElementChildren(model: V1Model, predicate?: (model: V1Model) => boolean): ModelResult[];

declare function getElements(root?: ElementID): V1Element[];

declare function getSelectedElements(): Element[];

type WidgetsCache<T> = Record<string, T>;
declare function getWidgetsCache<T extends V1ElementConfig>(): WidgetsCache<T> | null;

type Options = {
	useHistory?: boolean;
	at?: number;
	edit?: boolean;
};
type MoveElementParams = {
	element: V1Element;
	targetContainer: V1Element;
	options?: Options;
};
declare function moveElement({ element, targetContainer, options }: MoveElementParams): V1Element;

type MoveOptions = {
	useHistory?: boolean;
	at?: number;
	edit?: boolean;
};
type MoveInput = {
	element: V1Element;
	targetContainer: V1Element;
	options?: MoveOptions;
};
type MoveElementsParams = {
	moves: MoveInput[];
	title: string;
	subtitle?: string;
	onMoveElements?: () => void;
	onRestoreElements?: () => void;
};
type MovedElement = {
	element: V1Element;
	originalContainer: V1Element;
	originalIndex: number;
	targetContainer: V1Element;
	options?: MoveOptions;
};
type MovedElementsResult = {
	movedElements: MovedElement[];
};

declare const moveElements: ({
	moves: movesToMake,
	title,
	subtitle,
	onMoveElements,
	onRestoreElements,
}: MoveElementsParams) => MovedElementsResult;

type RemoveElementsParams = {
	elementIds: string[];
	title: string;
	subtitle?: string;
	onRemoveElements?: () => void;
	onRestoreElements?: () => void;
};
type RemovedElement = {
	container: V1Element;
	parent: V1Element;
	model: V1ElementModelProps;
	at: number;
};
type RemovedElementsResult = {
	removedElements: RemovedElement[];
};
declare const removeElements: ({
	elementIds,
	title,
	subtitle,
	onRemoveElements,
	onRestoreElements,
}: RemoveElementsParams) => RemovedElementsResult;

type ReplaceElementArgs = {
	currentElement: V1ElementData;
	newElement: Omit<V1ElementModelProps, 'id'>;
	withHistory?: boolean;
};
declare const replaceElement: ({ currentElement, newElement, withHistory }: ReplaceElementArgs) => Promise<V1Element>;

declare const updateElementEditorSettings: ({
	elementId,
	settings,
}: {
	elementId: string;
	settings: V1ElementModelProps['editor_settings'];
}) => void;

type UpdateElementSettingsArgs = {
	id: ElementID;
	props: Props;
	withHistory?: boolean;
};
declare const updateElementSettings: ({ id, props, withHistory }: UpdateElementSettingsArgs) => void;

type LinkValue = LinkPropValue['value'];
type LinkInLinkRestriction =
	| {
			shouldRestrict: true;
			reason: 'ancestor' | 'descendant';
			elementId: string | null;
	  }
	| {
			shouldRestrict: false;
			reason?: never;
			elementId?: never;
	  };
declare function getLinkInLinkRestriction(elementId: string, resolvedValue?: LinkValue): LinkInLinkRestriction;
declare function getAnchoredDescendantId(elementId: string): string | null;
declare function getAnchoredAncestorId(elementId: string): string | null;
declare function isElementAnchored(elementId: string): boolean;

declare const ELEMENT_STYLE_CHANGE_EVENT = 'elementor/editor-v2/editor-elements/style';
declare const styleRerenderEvents: (
	| _elementor_editor_v1_adapters.CommandEventDescriptor
	| _elementor_editor_v1_adapters.WindowEventDescriptor
)[];

type CreateElementStyleArgs = {
	styleId?: StyleDefinitionID;
	elementId: ElementID;
	classesProp: string;
	label: string;
	meta: StyleDefinitionVariant['meta'];
	props: StyleDefinitionVariant['props'];
	custom_css?: StyleDefinitionVariant['custom_css'];
	additionalVariants?: StyleDefinitionVariant[];
};
declare function createElementStyle({
	styleId,
	elementId,
	classesProp,
	label,
	meta,
	props,
	custom_css: customCss,
	additionalVariants,
}: CreateElementStyleArgs): string;
declare function shouldCreateNewLocalStyle<T>(
	payload: {
		styleId: StyleDefinition['id'] | null;
		provider: T | null;
	} | null
): boolean;

declare function deleteElementStyle(elementId: ElementID, styleId: StyleDefinitionID): void;

type UpdateElementStyleArgs = {
	elementId: ElementID;
	styleId: StyleDefinition['id'];
	meta: StyleDefinitionVariant['meta'];
	props: StyleDefinitionVariant['props'];
	custom_css?: StyleDefinitionVariant['custom_css'];
};
declare function updateElementStyle(args: UpdateElementStyleArgs): void;

declare const useElementInteractions: (elementId: ElementID) => ElementInteractions;

declare function getElementInteractions(elementId: ElementID): ElementInteractions | undefined;

declare const updateElementInteractions: ({
	elementId,
	interactions,
}: {
	elementId: string;
	interactions: V1ElementModelProps['interactions'];
}) => void;
declare const playElementInteractions: (elementId: string, interactionId: string) => void;

export {
	type AnimationPresetPropValue,
	type BooleanPropValue,
	type ConfigPropValue,
	type Control,
	type ControlItem,
	type ControlLayout,
	type ControlsSection,
	type CreateElementParams,
	type CreateElementStyleArgs,
	type DropElementParams,
	type DuplicateElementParams,
	type DuplicateElementsParams,
	type DuplicatedElement,
	type DuplicatedElementsResult,
	ELEMENT_STYLE_CHANGE_EVENT,
	type Element,
	type ElementChildren,
	type ElementControl,
	type ElementID,
	type ElementInteractions,
	type ElementModel,
	type ElementType,
	type ExcludedBreakpointsPropValue,
	type ExtendedWindow,
	type InteractionBreakpointsPropValue,
	type InteractionItemPropValue,
	type LinkInLinkRestriction,
	type ModelResult,
	type MoveElementParams,
	type NumberPropValue,
	type PseudoState,
	type StringPropValue,
	type TimingConfigPropValue,
	type UpdateElementSettingsArgs,
	type UpdateElementStyleArgs,
	type V1Element,
	type V1ElementConfig,
	type V1ElementData,
	type V1ElementEditorSettingsProps,
	type V1ElementModelProps,
	type V1ElementSettingsProps,
	createElement,
	createElementStyle,
	createElements,
	deleteElement,
	deleteElementStyle,
	dropElement,
	duplicateElement,
	duplicateElements,
	findChildRecursive,
	generateElementId,
	getAllDescendants,
	getAnchoredAncestorId,
	getAnchoredDescendantId,
	getContainer,
	getCurrentDocumentContainer,
	getCurrentDocumentId,
	getElementChildren as getElementChildrenWithFallback,
	getElementEditorSettings,
	getElementInteractions,
	getElementLabel,
	getElementSetting,
	getElementSettings,
	getElementStyles,
	getElementType,
	getElements,
	getLinkInLinkRestriction,
	getSelectedElements,
	getWidgetsCache,
	isElementAnchored,
	moveElement,
	moveElements,
	playElementInteractions,
	removeElements,
	replaceElement,
	selectElement,
	shouldCreateNewLocalStyle,
	styleRerenderEvents,
	updateElementEditorSettings,
	updateElementInteractions,
	updateElementSettings,
	updateElementStyle,
	useElementChildren,
	useElementEditorSettings,
	useElementInteractions,
	useParentElement,
	useSelectedElement,
	useSelectedElementSettings,
};
