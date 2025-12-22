import type {
	AnimationPresetPropValue,
	ElementInteractions,
	InteractionItemPropValue,
	NumberPropValue,
	StringPropValue,
	TimingConfigPropValue,
} from '@elementor/editor-elements';

export type {
	StringPropValue,
	NumberPropValue,
	TimingConfigPropValue,
	AnimationPresetPropValue,
	InteractionItemPropValue,
	ElementInteractions,
};

export type AnimationOption = {
	value: string;
	label: string;
};

export type InteractionConstants = {
	defaultDuration: number;
	defaultDelay: number;
	slideDistance: number;
	scaleStart: number;
	easing: string;
};

export type InteractionsConfig = {
	constants: InteractionConstants;
	animationOptions: AnimationOption[];
};

export type FieldProps = {
	value: string;
	onChange: ( value: string ) => void;
	label?: string;
};

export type DirectionFieldProps = FieldProps & {
	interactionType: string;
};

export type ElementInteractionData = {
	elementId: string;
	dataId: string; // The data-id attribute for DOM selection
	interactions: ElementInteractions;
};

export type InteractionsCollection = ElementInteractionData[];

export type InteractionsProvider = {
	getKey: () => string;
	priority: number;
	subscribe: ( callback: () => void ) => () => void;
	actions: {
		all: () => ElementInteractionData[];
	};
};

export type InteractionItemValue = InteractionItemPropValue[ 'value' ];
