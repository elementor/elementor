import { __ } from '@wordpress/i18n';

export type TransitionProperty = {
	label: string;
	value: string;
	unavailable?: boolean;
};

export type TransitionCategory = {
	label: string;
	type: 'category';
	properties: TransitionProperty[];
};

export const ALL_PROPERTIES_VALUE = 'all';

export const initialTransitionValue = {
	selection: {
		$$type: 'key-value',
		value: {
			key: { value: __( 'All properties', 'elementor' ), $$type: 'string' },
			value: { value: ALL_PROPERTIES_VALUE, $$type: 'string' },
		},
	},
	size: { $$type: 'size', value: { size: 200, unit: 'ms' } },
};

export const transitionProperties: TransitionCategory[] = [
	{
		label: __( 'Default', 'elementor' ),
		type: 'category',
		properties: [ { label: __( 'All properties', 'elementor' ), value: ALL_PROPERTIES_VALUE } ],
	},
];

export const transitionsItemsList = transitionProperties.map( ( category ) => ( {
	label: category.label,
	items: category.properties.map( ( property ) => property.label ),
} ) );
