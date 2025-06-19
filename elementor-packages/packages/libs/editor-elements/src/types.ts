import { type PropsSchema } from '@elementor/editor-props';

export type ElementID = string;

export type Element = {
	id: ElementID;
	type: string;
};

export type ElementType = {
	key: string;
	controls: ControlItem[];
	propsSchema: PropsSchema;
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

export type ControlItem = ControlsSection | Control;

export type ControlLayout = 'full' | 'two-columns';
