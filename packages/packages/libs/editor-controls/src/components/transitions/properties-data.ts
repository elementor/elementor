export type TransitionPropertyLicense = 'free' | 'pro';

export type TransitionProperty = {
	label: string;
	value: string;
	license: TransitionPropertyLicense;
};

export type TransitionCategory = {
	label: string;
	type: 'category'; 
	properties: TransitionProperty[];
};

export const transitionProperties: TransitionCategory[] = [
	{
		label: 'Common',
		type: 'category',
		properties: [
			{ label: 'All properties', value: 'all', license: 'free' },
		],
	},
];
