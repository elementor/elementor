import { type StyleTarget } from '@elementor/editor-editing-panel';
import { type BreakpointNode } from '@elementor/editor-responsive';

import { type CompositeWidgetPreset } from '../../../types';
import { type PresetParts } from '../get-preset-parts';
import { type PropsByBreakpoint } from '../resolve-breakpoint-value';

export const BREAKPOINTS_TREE: BreakpointNode = {
	id: 'desktop',
	label: 'Desktop',
	children: [
		{ id: 'widescreen', label: 'Widescreen', type: 'min-width', children: [] },
		{
			id: 'tablet',
			label: 'Tablet',
			type: 'max-width',
			children: [ { id: 'mobile', label: 'Mobile', type: 'max-width', children: [] } ],
		},
	],
};

export const color = ( value: string ) => ( { $$type: 'color', value } );

export const background = ( value: Record< string, unknown > ) => ( { $$type: 'background', value } );

export const BUTTON_STYLE_PRESET: CompositeWidgetPreset = {
	id: 'button_style',
	label: 'Button style',
	options: [
		{
			id: 'filled',
			label: 'Filled',
			set: [
				{
					part: 'root',
					style: {
						desktop: { background: background( { color: color( '#111111' ) } ) },
						mobile: { padding: { $$type: 'size', value: { size: 8, unit: 'px' } } },
					},
				},
				{ part: 'label', style: { desktop: { color: color( '#ffffff' ) } } },
			],
		},
		{
			id: 'outline',
			label: 'Outline',
			set: [
				{ part: 'root', style: { desktop: { background: background( { color: color( 'transparent' ) } ) } } },
				{ part: 'label', style: { desktop: { color: color( '#111111' ) } } },
			],
		},
	],
};

const target = ( elementId: string ): StyleTarget => ( {
	elementId,
	classesProp: 'classes',
	styleId: `${ elementId }-local`,
	provider: null,
} );

export const createParts = ( propsByPart: Record< string, PropsByBreakpoint > ): PresetParts =>
	Object.fromEntries(
		Object.entries( propsByPart ).map( ( [ part, propsByBreakpoint ] ) => [
			part,
			{ target: target( `${ part }-id` ), propsByBreakpoint },
		] )
	);
