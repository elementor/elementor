import { type KeyValuePropValue, type SizePropValue } from '@elementor/editor-props';
import { isVersionGreaterOrEqual } from '@elementor/utils';
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

const MIN_PRO_VERSION = '3.35';

const getIsSiteRtl = () => {
	return !! window.elementorFrontend?.config?.is_rtl;
};

// TODO: Remove this after version 4.01 is released
const shouldExtendTransitionProperties = (): boolean => {
	const hasProInstalled = !! window.elementorPro;

	if ( ! hasProInstalled ) {
		return true;
	}

	const proVersion = window.elementorPro?.config?.version;

	if ( ! proVersion ) {
		return false;
	}

	return isVersionGreaterOrEqual( proVersion, MIN_PRO_VERSION );
};

const createTransitionPropertiesList = (): TransitionCategory[] => {
	const isSiteRtl = getIsSiteRtl();

	const baseProperties: TransitionCategory[] = [
		{
			label: __( 'Default', 'elementor' ),
			type: 'category',
			properties: [ { label: __( 'All properties', 'elementor' ), value: 'all' } ],
		},
		{
			label: __( 'Margin', 'elementor' ),
			type: 'category',
			properties: [
				{ label: __( 'Margin (all)', 'elementor' ), value: 'margin', isDisabled: true },
				{ label: __( 'Margin bottom', 'elementor' ), value: 'margin-block-end', isDisabled: true },
				{
					label: isSiteRtl ? __( 'Margin right', 'elementor' ) : __( 'Margin left', 'elementor' ),
					value: 'margin-inline-start',
					isDisabled: true,
				},
				{
					label: isSiteRtl ? __( 'Margin left', 'elementor' ) : __( 'Margin right', 'elementor' ),
					value: 'margin-inline-end',
					isDisabled: true,
				},
				{ label: __( 'Margin top', 'elementor' ), value: 'margin-block-start', isDisabled: true },
			],
		},
		{
			label: __( 'Padding', 'elementor' ),
			type: 'category',
			properties: [
				{ label: __( 'Padding (all)', 'elementor' ), value: 'padding', isDisabled: true },
				{ label: __( 'Padding bottom', 'elementor' ), value: 'padding-block-end', isDisabled: true },
				{
					label: isSiteRtl ? __( 'Padding right', 'elementor' ) : __( 'Padding left', 'elementor' ),
					value: 'padding-inline-start',
					isDisabled: true,
				},
				{
					label: isSiteRtl ? __( 'Padding left', 'elementor' ) : __( 'Padding right', 'elementor' ),
					value: 'padding-inline-end',
					isDisabled: true,
				},
				{ label: __( 'Padding top', 'elementor' ), value: 'padding-block-start', isDisabled: true },
			],
		},
		{
			label: __( 'Flex', 'elementor' ),
			type: 'category',
			properties: [
				{ label: __( 'Flex (all)', 'elementor' ), value: 'flex', isDisabled: true },
				{ label: __( 'Flex grow', 'elementor' ), value: 'flex-grow', isDisabled: true },
				{ label: __( 'Flex shrink', 'elementor' ), value: 'flex-shrink', isDisabled: true },
				{ label: __( 'Flex basis', 'elementor' ), value: 'flex-basis', isDisabled: true },
			],
		},
		{
			label: __( 'Size', 'elementor' ),
			type: 'category',
			properties: [
				{ label: __( 'Width', 'elementor' ), value: 'width', isDisabled: true },
				{ label: __( 'Height', 'elementor' ), value: 'height', isDisabled: true },
				{ label: __( 'Max height', 'elementor' ), value: 'max-height', isDisabled: true },
				{ label: __( 'Max width', 'elementor' ), value: 'max-width', isDisabled: true },
				{ label: __( 'Min height', 'elementor' ), value: 'min-height', isDisabled: true },
				{ label: __( 'Min width', 'elementor' ), value: 'min-width', isDisabled: true },
			],
		},
		{
			label: __( 'Position', 'elementor' ),
			type: 'category',
			properties: [
				{ label: __( 'Top', 'elementor' ), value: 'inset-block-start', isDisabled: true },
				{
					label: isSiteRtl ? __( 'Right', 'elementor' ) : __( 'Left', 'elementor' ),
					value: 'inset-inline-start',
					isDisabled: true,
				},
				{
					label: isSiteRtl ? __( 'Left', 'elementor' ) : __( 'Right', 'elementor' ),
					value: 'inset-inline-end',
					isDisabled: true,
				},
				{ label: __( 'Bottom', 'elementor' ), value: 'inset-block-end', isDisabled: true },
				{ label: __( 'Z-index', 'elementor' ), value: 'z-index', isDisabled: true },
			],
		},
		{
			label: __( 'Typography', 'elementor' ),
			type: 'category',
			properties: [
				{ label: __( 'Font color', 'elementor' ), value: 'color', isDisabled: true },
				{ label: __( 'Font size', 'elementor' ), value: 'font-size', isDisabled: true },
				{ label: __( 'Line height', 'elementor' ), value: 'line-height', isDisabled: true },
				{ label: __( 'Letter spacing', 'elementor' ), value: 'letter-spacing', isDisabled: true },
				{ label: __( 'Word spacing', 'elementor' ), value: 'word-spacing', isDisabled: true },
				{ label: __( 'Font variations', 'elementor' ), value: 'font-variation-settings', isDisabled: true },
				{ label: __( 'Text stroke color', 'elementor' ), value: '-webkit-text-stroke-color', isDisabled: true },
			],
		},
		{
			label: __( 'Background', 'elementor' ),
			type: 'category',
			properties: [
				{ label: __( 'Background color', 'elementor' ), value: 'background-color', isDisabled: true },
				{ label: __( 'Background position', 'elementor' ), value: 'background-position', isDisabled: true },
				{ label: __( 'Box shadow', 'elementor' ), value: 'box-shadow', isDisabled: true },
			],
		},
		{
			label: __( 'Border', 'elementor' ),
			type: 'category',
			properties: [
				{ label: __( 'Border (all)', 'elementor' ), value: 'border', isDisabled: true },
				{ label: __( 'Border radius', 'elementor' ), value: 'border-radius', isDisabled: true },
				{ label: __( 'Border color', 'elementor' ), value: 'border-color', isDisabled: true },
				{ label: __( 'Border width', 'elementor' ), value: 'border-width', isDisabled: true },
			],
		},
		{
			label: __( 'Effects', 'elementor' ),
			type: 'category',
			properties: [
				{ label: __( 'Opacity', 'elementor' ), value: 'opacity', isDisabled: true },
				{ label: __( 'Transform (all)', 'elementor' ), value: 'transform', isDisabled: true },
				{ label: __( 'Filter (all)', 'elementor' ), value: 'filter', isDisabled: true },
			],
		},
	];

	return shouldExtendTransitionProperties() ? baseProperties : [ baseProperties[ 0 ] ];
};

export const transitionProperties: TransitionCategory[] = createTransitionPropertiesList();

export const transitionsItemsList = transitionProperties.map( ( category ) => ( {
	label: category.label,
	items: category.properties.map( ( property ) => property.label ),
} ) );
