import { getBreakpointsTree } from '@elementor/editor-responsive';

import { type ExtendedWindow, type V1Breakpoints } from '../../types';
import { getBreakpoints } from '../get-breakpoints';

const desktopBreakpoint = {
	id: 'desktop',
	label: 'Desktop',
};
const widescreenBreakpoint = {
	id: 'widescreen',
	label: 'Widescreen',
	type: 'min-width',
	width: 2400,
};
const tabletExtraBreakpoint = {
	id: 'tablet_extra',
	label: 'Tablet Landscape',
	type: 'max-width',
	width: 1200,
};
const tabletBreakpoint = {
	id: 'tablet',
	label: 'Tablet Portrait',
	type: 'max-width',
	width: 1024,
};
const mobileBreakpoint = {
	id: 'mobile',
	label: 'Mobile Portrait',
	type: 'max-width',
	width: 767,
};

const mockBreakpoints = {
	mobile: {
		label: 'Mobile Portrait',
		value: 767,
		direction: 'max',
		is_enabled: true,
	},
	mobile_extra: {
		label: 'Mobile Landscape',
		value: 880,
		direction: 'max',
		is_enabled: false,
	},
	tablet: {
		label: 'Tablet Portrait',
		value: 1024,
		direction: 'max',
		is_enabled: true,
	},
	tablet_extra: {
		label: 'Tablet Landscape',
		value: 1200,
		direction: 'max',
		is_enabled: true,
	},
	laptop: {
		label: 'Laptop',
		value: 1366,
		direction: 'max',
		is_enabled: false,
	},
	widescreen: {
		label: 'Widescreen',
		value: 2400,
		direction: 'min',
		is_enabled: true,
	},
} as V1Breakpoints;

const mockEmptyBreakpoints = {} as V1Breakpoints;

describe( 'getBreakpoints', () => {
	describe.each( [
		{
			type: 'array',
			getter: getBreakpoints,
		},
		{
			type: 'tree',
			getter: getBreakpointsTree,
		},
	] as const )( 'Get breakpoints as $type', ( { getter, type } ) => {
		const items = [
			{
				type: 'filled',
				breakpoints: mockBreakpoints,
				expected: {
					array: [
						widescreenBreakpoint,
						desktopBreakpoint,
						tabletExtraBreakpoint,
						tabletBreakpoint,
						mobileBreakpoint,
					],
					tree: {
						...desktopBreakpoint,
						children: [
							{
								...widescreenBreakpoint,
								children: [],
							},
							{
								...tabletExtraBreakpoint,
								children: [
									{
										...tabletBreakpoint,
										children: [
											{
												...mobileBreakpoint,
												children: [],
											},
										],
									},
								],
							},
						],
					},
				},
			},
			{
				type: 'empty',
				breakpoints: mockEmptyBreakpoints,
				expected: {
					array: [],
					tree: {
						children: [],
					},
				},
			},
		] as const;

		it.each( items )( 'should handle with $type breakpoints config', ( { breakpoints, expected } ) => {
			// Arrange.
			const extendedWindow = window as unknown as ExtendedWindow;

			extendedWindow.elementor = {
				config: {
					responsive: {
						breakpoints,
					},
				},
			};

			const breakpointsData = getter();

			// Assert.
			expect( breakpointsData ).toEqual( expected[ type ] );
		} );
	} );
} );
