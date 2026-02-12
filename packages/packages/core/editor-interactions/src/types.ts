import { type Unit } from '@elementor/editor-controls';
import type {
	AnimationKeyframe,
	AnimationKeyframesPropValue,
	AnimationKeyframeStopPropValue,
	AnimationPresetPropValue,
	ConfigPropValue,
	CustomEffect,
	CustomEffectPropValue,
	ElementInteractions,
	ExcludedBreakpointsPropValue,
	InteractionBreakpointsPropValue,
	InteractionItemPropValue,
	KeyframeStopSettings,
	KeyframeStopSettingsPropValue,
	TimingConfigPropValue,
	Transform3d,
	Transform3dPropValue,
} from '@elementor/editor-elements';

export type {
	ConfigPropValue,
	TimingConfigPropValue,
	AnimationPresetPropValue,
	InteractionItemPropValue,
	ElementInteractions,
	ExcludedBreakpointsPropValue,
	InteractionBreakpointsPropValue,
	CustomEffectPropValue,
	CustomEffect,
	AnimationKeyframe,
	AnimationKeyframesPropValue,
	AnimationKeyframeStopPropValue,
	KeyframeStopSettings,
	KeyframeStopSettingsPropValue,
	Transform3d,
	Transform3dPropValue,
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

export type FieldProps< T = string > = {
	value: T;
	onChange: ( value: T ) => void;
	label?: string;
	disabled?: boolean;
};

export type ReplayFieldProps = FieldProps< boolean >;
export type DirectionFieldProps = FieldProps< string > & {
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

export type SizeStringValue = `${ number }${ Unit }` | number;
