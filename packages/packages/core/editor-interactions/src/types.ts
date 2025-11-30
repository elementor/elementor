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

export type InteractionsData = {
	version: number;
	items: Array< {
		interaction_id?: string;
		animation: {
			animation_type: string;
			animation_id: string;
		};
	} >;
};
