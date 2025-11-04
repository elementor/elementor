export interface AnimationOption {
	value: string;
	label: string;
}

export interface InteractionConstants {
	defaultDuration: number;
	defaultDelay: number;
	slideDistance: number;
	scaleStart: number;
	easing: string;
}

export interface InteractionsConfig {
	constants: InteractionConstants;
	animationOptions: AnimationOption[];
}

export type FieldProps = {
	value: string;
	onChange: ( value: string ) => void;
};
