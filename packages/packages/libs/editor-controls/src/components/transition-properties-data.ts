export type TransitionProperty = {
	label: string;
	value: string;
	type: 'property';
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
			{ label: 'All properties', value: 'all', type: 'property' },
			{ label: 'Opacity', value: 'opacity', type: 'property' },
			{ label: 'Margin', value: 'margin', type: 'property' },
			{ label: 'Padding', value: 'padding', type: 'property' },
			{ label: 'Border', value: 'border', type: 'property' },
			{ label: 'Transform', value: 'transform', type: 'property' },
			{ label: 'Filter', value: 'filter', type: 'property' },
			{ label: 'Flex', value: 'flex', type: 'property' },
		],
	},
	{
		label: 'Margin',
		type: 'category',
		properties: [
			{ label: 'Margin bottom', value: 'margin-bottom', type: 'property' },
			{ label: 'Margin left', value: 'margin-left', type: 'property' },
			{ label: 'Margin right', value: 'margin-right', type: 'property' },
			{ label: 'Margin top', value: 'margin-top', type: 'property' },
		],
	},
	{
		label: 'Padding',
		type: 'category',
		properties: [
			{ label: 'Padding bottom', value: 'padding-bottom', type: 'property' },
			{ label: 'Padding left', value: 'padding-left', type: 'property' },
			{ label: 'Padding right', value: 'padding-right', type: 'property' },
			{ label: 'Padding top', value: 'padding-top', type: 'property' },
		],
	},
	{
		label: 'Flex',
		type: 'category',
		properties: [
			{ label: 'Flex grow', value: 'flex-grow', type: 'property' },
			{ label: 'Flex shrink', value: 'flex-shrink', type: 'property' },
			{ label: 'Flex basis', value: 'flex-basis', type: 'property' },
		],
	},
	{
		label: 'Size',
		type: 'category',
		properties: [
			{ label: 'Width', value: 'width', type: 'property' },
			{ label: 'Height', value: 'height', type: 'property' },
			{ label: 'Max height', value: 'max-height', type: 'property' },
			{ label: 'Max width', value: 'max-width', type: 'property' },
			{ label: 'Min height', value: 'min-height', type: 'property' },
			{ label: 'Min width', value: 'min-width', type: 'property' },
		],
	},
	{
		label: 'Position',
		type: 'category',
		properties: [
			{ label: 'Top', value: 'top', type: 'property' },
			{ label: 'Left', value: 'left', type: 'property' },
			{ label: 'Bottom', value: 'bottom', type: 'property' },
			{ label: 'Right', value: 'right', type: 'property' },
			{ label: 'Z-Index', value: 'z-index', type: 'property' },
		],
	},
	{
		label: 'Typography',
		type: 'category',
		properties: [
			{ label: 'Font color', value: 'color', type: 'property' },
			{ label: 'Font size', value: 'font-size', type: 'property' },
			{ label: 'Line height', value: 'line-height', type: 'property' },
			{ label: 'Letter spacing', value: 'letter-spacing', type: 'property' },
			{ label: 'Text indent', value: 'text-indent', type: 'property' },
			{ label: 'Text shadow', value: 'text-shadow', type: 'property' },
			{ label: 'Word spacing', value: 'word-spacing', type: 'property' },
			{ label: 'Font variations', value: 'font-variation-settings', type: 'property' },
			{ label: 'Text stroke color', value: '-webkit-text-stroke-color', type: 'property' },
			{ label: 'Text underline offset', value: 'text-underline-offset', type: 'property' },
			{ label: 'Text decoration color', value: 'text-decoration-color', type: 'property' },
		],
	},
	{
		label: 'Background',
		type: 'category',
		properties: [
			{ label: 'Background color', value: 'background-color', type: 'property' },
			{ label: 'Background position', value: 'background-position', type: 'property' },
			{ label: 'Box shadow', value: 'box-shadow', type: 'property' },
		],
	},
	{
		label: 'Borders',
		type: 'category',
		properties: [
			{ label: 'Border radius', value: 'border-radius', type: 'property' },
			{ label: 'Border color', value: 'border-color', type: 'property' },
			{ label: 'Border width', value: 'border-width', type: 'property' },
		],
	},
];
