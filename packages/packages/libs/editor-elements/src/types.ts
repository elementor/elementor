import { type PropsSchema } from '@elementor/editor-props';
import { type ClassState } from '@elementor/editor-styles';

export type ElementID = string;

export type Element = {
	id: ElementID;
	type: string;
};

export type PseudoState = {
	name: string;
	value: string;
};

export type ElementType = {
	key: string;
	controls: ControlItem[];
	propsSchema: PropsSchema;
	dependenciesPerTargetMapping?: Record< string, string[] >;
	styleStates?: ClassState[];
	pseudoStates?: PseudoState[];
	title: string;
};

export type ControlsSection = {
	type: 'section';
	value: {
		description?: string;
		label: string;
		items: ControlItem[];
	};
};

export type Control = {
	type: 'control';
	value: {
		bind: string;
		label?: string;
		description?: string;
		type: string;
		props: Record< string, unknown >;
		meta?: {
			layout?: ControlLayout;
			topDivider?: boolean;
		};
	};
};

export type ElementControl = {
	type: 'element-control';
	value: {
		type: string;
		label?: string;
		props: Record< string, unknown >;
		meta?: {
			layout?: ControlLayout;
			topDivider?: boolean;
		};
	};
};

export type ControlItem = ControlsSection | Control | ElementControl;

export type ControlLayout = 'full' | 'two-columns' | 'custom';
