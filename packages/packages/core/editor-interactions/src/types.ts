import { type ElementInteractions } from '@elementor/editor-elements';

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

export type InteractionItem = {
	elementId: string;
	dataId: string; // The data-id attribute for DOM selection
	interactions: ElementInteractions;
};

export type InteractionsCollection = InteractionItem[];

export type InteractionsProvider = {
	getKey: () => string;
	priority: number;
	subscribe: ( callback: () => void ) => () => void;
	actions: {
		all: () => InteractionItem[];
	};
};

export type StringPropValue = {
	$$type: 'string';
	value: string;
};

export type NumberPropValue = {
	$$type: 'number';
	value: number;
};

export type TimingConfigPropValue = {
	$$type: 'timing-config';
	value: {
		duration: NumberPropValue;
		delay: NumberPropValue;
	};
};

export type AnimationPresetPropValue = {
	$$type: 'animation-preset-props';
	value: {
		effect: StringPropValue;
		type: StringPropValue;
		direction: StringPropValue;
		timing_config: TimingConfigPropValue;
	};
};

export type InteractionItemPropValue = {
	$$type: 'interaction-item';
	value: {
		interaction_id: StringPropValue;
		trigger: StringPropValue;
		animation: AnimationPresetPropValue;
	};
};

export type InteractionsPropType = {
	version: number;
	items: InteractionItemPropValue[];
};

export type InteractionItemValue = InteractionItemPropValue[ 'value' ];