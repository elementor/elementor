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
			{ label: 'Opacity', value: 'opacity', license: 'pro' },
			{ label: 'Margin', value: 'margin', license: 'pro' },
			{ label: 'Padding', value: 'padding', license: 'pro' },
			{ label: 'Border', value: 'border', license: 'pro' },
			{ label: 'Transform', value: 'transform', license: 'pro' },
			{ label: 'Filter', value: 'filter', license: 'pro' },
			{ label: 'Flex', value: 'flex', license: 'pro' },
		],
	},
	{
		label: 'Margin',
		type: 'category',
		properties: [
			{ label: 'Margin bottom', value: 'margin-bottom', license: 'pro' },
			{ label: 'Margin left', value: 'margin-left', license: 'pro' },
			{ label: 'Margin right', value: 'margin-right', license: 'pro' },
			{ label: 'Margin top', value: 'margin-top', license: 'pro' },
		],
	},
	{
		label: 'Padding',
		type: 'category',
		properties: [
			{ label: 'Padding bottom', value: 'padding-bottom', license: 'pro' },
			{ label: 'Padding left', value: 'padding-left', license: 'pro' },
			{ label: 'Padding right', value: 'padding-right', license: 'pro' },
			{ label: 'Padding top', value: 'padding-top', license: 'pro' },
		],
	},
	{
		label: 'Flex',
		type: 'category',
		properties: [
			{ label: 'Flex grow', value: 'flex-grow', license: 'pro' },
			{ label: 'Flex shrink', value: 'flex-shrink', license: 'pro' },
			{ label: 'Flex basis', value: 'flex-basis', license: 'pro' },
		],
	},
	{
		label: 'Size',
		type: 'category',
		properties: [
			{ label: 'Width', value: 'width', license: 'pro' },
			{ label: 'Height', value: 'height', license: 'pro' },
			{ label: 'Max height', value: 'max-height', license: 'pro' },
			{ label: 'Max width', value: 'max-width', license: 'pro' },
			{ label: 'Min height', value: 'min-height', license: 'pro' },
			{ label: 'Min width', value: 'min-width', license: 'pro' },
		],
	},
	{
		label: 'Position',
		type: 'category',
		properties: [
			{ label: 'Top', value: 'top', license: 'pro' },
			{ label: 'Left', value: 'left', license: 'pro' },
			{ label: 'Bottom', value: 'bottom', license: 'pro' },
			{ label: 'Right', value: 'right', license: 'pro' },
			{ label: 'Z-Index', value: 'z-index', license: 'pro' },
		],
	},
	{
		label: 'Typography',
		type: 'category',
		properties: [
			{ label: 'Font color', value: 'color', license: 'pro' },
			{ label: 'Font size', value: 'font-size', license: 'pro' },
			{ label: 'Line height', value: 'line-height', license: 'pro' },
			{ label: 'Letter spacing', value: 'letter-spacing', license: 'pro' },
			{ label: 'Text indent', value: 'text-indent', license: 'pro' },
			{ label: 'Text shadow', value: 'text-shadow', license: 'pro' },
			{ label: 'Word spacing', value: 'word-spacing', license: 'pro' },
			{ label: 'Font variations', value: 'font-variation-settings', license: 'pro' },
			{ label: 'Text stroke color', value: '-webkit-text-stroke-color', license: 'pro' },
			{ label: 'Text underline offset', value: 'text-underline-offset', license: 'pro' },
			{ label: 'Text decoration color', value: 'text-decoration-color', license: 'pro' },
		],
	},
	{
		label: 'Background',
		type: 'category',
		properties: [
			{ label: 'Background color', value: 'background-color', license: 'pro' },
			{ label: 'Background position', value: 'background-position', license: 'pro' },
			{ label: 'Box shadow', value: 'box-shadow', license: 'pro' },
		],
	},
	{
		label: 'Borders',
		type: 'category',
		properties: [
			{ label: 'Border radius', value: 'border-radius', license: 'pro' },
			{ label: 'Border color', value: 'border-color', license: 'pro' },
			{ label: 'Border width', value: 'border-width', license: 'pro' },
		],
	},
];
