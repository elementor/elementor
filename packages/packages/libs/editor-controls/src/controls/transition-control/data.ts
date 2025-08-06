export type TransitionProperty = {
	label: string;
	value: string;
};

export type TransitionCategory = {
	label: string;
	type: 'category';
	properties: TransitionProperty[];
};

export const initialTransitionValue = {
	selection: {
		$$type: 'key-value',
		value: {
			key: { value: 'All properties', $$type: 'string' },
			value: { value: 'all', $$type: 'string' },
		},
	},
	size: { $$type: 'size', value: { size: 200, unit: 'ms' } },
};

export const transitionProperties: TransitionCategory[] = [
	{
		label: 'Common',
		type: 'category',
		properties: [ { label: 'All properties', value: 'all' } ],
	},
];

export const transitionsItemsList = transitionProperties.map( ( category ) => ( {
	label: category.label,
	items: category.properties.map( ( property ) => property.label ),
} ) );
