export type TransitionPropertyType = 'free' | 'pro';

export type TransitionProperty = {
	label: string;
	value: string;
	type: TransitionPropertyType;
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
			{ label: 'All properties', value: 'all', type: 'free' },
			{ label: 'Opacity', value: 'opacity', type: 'pro' },
			{ label: 'Margin', value: 'margin', type: 'pro' },
			{ label: 'Padding', value: 'padding', type: 'pro' },
			{ label: 'Border', value: 'border', type: 'pro' },
			{ label: 'Transform', value: 'transform', type: 'pro' },
			{ label: 'Filter', value: 'filter', type: 'pro' },
			{ label: 'Flex', value: 'flex', type: 'pro' },
		],
	},
	{
		label: 'Margin',
		type: 'category',
		properties: [
			{ label: 'Margin bottom', value: 'margin-bottom', type: 'pro' },
			{ label: 'Margin left', value: 'margin-left', type: 'pro' },
			{ label: 'Margin right', value: 'margin-right', type: 'pro' },
			{ label: 'Margin top', value: 'margin-top', type: 'pro' },
		],
	},
	{
		label: 'Padding',
		type: 'category',
		properties: [
			{ label: 'Padding bottom', value: 'padding-bottom', type: 'pro' },
			{ label: 'Padding left', value: 'padding-left', type: 'pro' },
			{ label: 'Padding right', value: 'padding-right', type: 'pro' },
			{ label: 'Padding top', value: 'padding-top', type: 'pro' },
		],
	},
	{
		label: 'Flex',
		type: 'category',
		properties: [
			{ label: 'Flex grow', value: 'flex-grow', type: 'pro' },
			{ label: 'Flex shrink', value: 'flex-shrink', type: 'pro' },
			{ label: 'Flex basis', value: 'flex-basis', type: 'pro' },
		],
	},
	{
		label: 'Size',
		type: 'category',
		properties: [
			{ label: 'Width', value: 'width', type: 'pro' },
			{ label: 'Height', value: 'height', type: 'pro' },
			{ label: 'Max height', value: 'max-height', type: 'pro' },
			{ label: 'Max width', value: 'max-width', type: 'pro' },
			{ label: 'Min height', value: 'min-height', type: 'pro' },
			{ label: 'Min width', value: 'min-width', type: 'pro' },
		],
	},
	{
		label: 'Position',
		type: 'category',
		properties: [
			{ label: 'Top', value: 'top', type: 'pro' },
			{ label: 'Left', value: 'left', type: 'pro' },
			{ label: 'Bottom', value: 'bottom', type: 'pro' },
			{ label: 'Right', value: 'right', type: 'pro' },
			{ label: 'Z-Index', value: 'z-index', type: 'pro' },
		],
	},
	{
		label: 'Typography',
		type: 'category',
		properties: [
			{ label: 'Font color', value: 'color', type: 'pro' },
			{ label: 'Font size', value: 'font-size', type: 'pro' },
			{ label: 'Line height', value: 'line-height', type: 'pro' },
			{ label: 'Letter spacing', value: 'letter-spacing', type: 'pro' },
			{ label: 'Text indent', value: 'text-indent', type: 'pro' },
			{ label: 'Text shadow', value: 'text-shadow', type: 'pro' },
			{ label: 'Word spacing', value: 'word-spacing', type: 'pro' },
			{ label: 'Font variations', value: 'font-variation-settings', type: 'pro' },
			{ label: 'Text stroke color', value: '-webkit-text-stroke-color', type: 'pro' },
			{ label: 'Text underline offset', value: 'text-underline-offset', type: 'pro' },
			{ label: 'Text decoration color', value: 'text-decoration-color', type: 'pro' },
		],
	},
	{
		label: 'Background',
		type: 'category',
		properties: [
			{ label: 'Background color', value: 'background-color', type: 'pro' },
			{ label: 'Background position', value: 'background-position', type: 'pro' },
			{ label: 'Box shadow', value: 'box-shadow', type: 'pro' },
		],
	},
	{
		label: 'Borders',
		type: 'category',
		properties: [
			{ label: 'Border radius', value: 'border-radius', type: 'pro' },
			{ label: 'Border color', value: 'border-color', type: 'pro' },
			{ label: 'Border width', value: 'border-width', type: 'pro' },
		],
	},
];
