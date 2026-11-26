import { createMockElement, createMockPropType } from 'test-utils';
import { type StylesInheritanceAPI, type StylesInheritanceSnapshot } from '@elementor/editor-editing-panel';
import { type PropsSchema, type PropValue } from '@elementor/editor-props';
import { type BreakpointId, type BreakpointNode } from '@elementor/editor-responsive';
import { type StyleDefinition } from '@elementor/editor-styles';

import { type CompositeWidgetPreset } from '../../../types';
import { type WidgetPartContainers } from '../../use-widget-part-containers';

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

export const STYLES_SCHEMA: PropsSchema = {
	background: createMockPropType( { kind: 'object', key: 'background', shape: {} } ),
	color: createMockPropType( { kind: 'plain', key: 'color' } ),
	padding: createMockPropType( { kind: 'plain', key: 'size' } ),
};

export const LOCAL_STYLE_ID = 'local';
export const CLASS_STYLE_ID = 'g-class';

export const color = ( value: string ) => ( { $$type: 'color', value } );
export const background = ( value: Record< string, unknown > ) => ( { $$type: 'background', value } );
export const size = ( value: number ) => ( { $$type: 'size', value: { size: value, unit: 'px' } } );

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
						mobile: { padding: size( 8 ) },
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

type StyledValue = { styleId: string; value: PropValue };

export type ElementStylesTable = Partial< Record< BreakpointId, Record< string, StyledValue[] > > >;

const BREAKPOINT_PATHS: Partial< Record< BreakpointId, BreakpointId[] > > = {
	desktop: [ 'desktop' ],
	widescreen: [ 'desktop', 'widescreen' ],
	tablet: [ 'desktop', 'tablet' ],
	mobile: [ 'desktop', 'tablet', 'mobile' ],
};

export function createInheritance( table: ElementStylesTable ): StylesInheritanceAPI {
	const toChain = ( values: StyledValue[] ) =>
		values.map( ( { styleId, value } ) => ( {
			style: { id: styleId } as StyleDefinition,
			provider: null,
			variant: { meta: { breakpoint: null, state: null }, props: {}, custom_css: null },
			value,
		} ) );

	return {
		getSnapshot: ( { breakpoint } ) =>
			( BREAKPOINT_PATHS[ breakpoint ?? 'desktop' ] ?? [] ).reduce< StylesInheritanceSnapshot >(
				( snapshot, pathBreakpoint ) => {
					Object.entries( table[ pathBreakpoint ] ?? {} ).forEach( ( [ prop, values ] ) => {
						snapshot[ prop ] = toChain( values );
					} );

					return snapshot;
				},
				{}
			),
		getInheritanceChain: ( snapshot, [ prop, key ] ) =>
			( snapshot[ prop ] ?? [] )
				.map( ( entry ) => ( {
					...entry,
					value: ( entry.value as { value: Record< string, PropValue > } ).value[ key ] ?? null,
				} ) )
				.filter( ( { value } ) => value !== null ),
	};
}

export const local = ( value: PropValue ): StyledValue[] => [ { styleId: LOCAL_STYLE_ID, value } ];

export const createContainers = ( parts: string[] ): WidgetPartContainers =>
	Object.fromEntries( parts.map( ( part ) => [ part, createMockElement( { model: { id: `${ part }-id` } } ) ] ) );
