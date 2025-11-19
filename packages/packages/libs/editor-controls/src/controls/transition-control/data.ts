import { type KeyValuePropValue, type SizePropValue } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

export type TransitionProperty = {
	label: string;
	value: string;
	unavailable?: boolean;
	isDisabled?: boolean;
};

export type TransitionCategory = {
	label: string;
	type: 'category';
	properties: TransitionProperty[];
};

export type TransitionValue = {
	selection: KeyValuePropValue;
	size: SizePropValue;
};

export type TransitionItem = {
	$$type: 'selection-size';
	value: {
		$$type: 'key-value';
		value: TransitionValue;
	};
};

export const initialTransitionValue: TransitionValue = {
	selection: {
		$$type: 'key-value',
		value: {
			key: { value: __( 'All properties', 'elementor' ), $$type: 'string' },
			value: { value: 'all', $$type: 'string' },
		},
	},
	size: { $$type: 'size', value: { size: 200, unit: 'ms' } },
};

export const transitionProperties: TransitionCategory[] = [
	{
		label: __( 'Default', 'elementor' ),
		type: 'category',
		properties: [ { label: __( 'All properties', 'elementor' ), value: 'all' } ],
	},
];

export const transitionsItemsList = transitionProperties.map( ( category ) => ( {
	label: category.label,
	items: category.properties.map( ( property ) => property.label ),
} ) );
