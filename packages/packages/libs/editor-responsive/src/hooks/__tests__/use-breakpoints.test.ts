import { renderHook } from '@testing-library/react';

import { type ExtendedWindow, type V1Breakpoints } from '../../types';
import { useBreakpoints } from '../use-breakpoints';

describe( 'useBreakpoints', () => {
	function setBreakpoints( breakpoints: Partial< V1Breakpoints > ) {
		const extendedWindow = window as unknown as ExtendedWindow;

		extendedWindow.elementor = {
			config: {
				responsive: {
					breakpoints: breakpoints as V1Breakpoints,
				},
			},
		};
	}

	it( 'should return an empty array if no breakpoints are available', () => {
		// Arrange.
		setBreakpoints( {} as never );

		// Act.
		const { result } = renderHook( useBreakpoints );

		// Assert.
		expect( result.current ).toEqual( [] );
	} );

	it( 'should filter out inactive breakpoints', () => {
		// Arrange.
		setBreakpoints( {
			tablet: {
				is_enabled: false,
				value: 1024,
				label: 'Tablet Portrait',
				direction: 'max',
			},
			mobile: {
				is_enabled: true,
				value: 767,
				label: 'Mobile Portrait',
				direction: 'max',
			},
		} );

		// Act.
		const { result } = renderHook( useBreakpoints );

		// Assert.
		expect( result.current ).toEqual( [
			{ id: 'desktop', label: 'Desktop' },
			{ id: 'mobile', label: 'Mobile Portrait', width: 767, type: 'max-width' },
		] );
	} );

	it( 'should return all breakpoints sorted by size', () => {
		// Arrange.
		setBreakpoints( {
			tablet: {
				is_enabled: true,
				value: 1024,
				label: 'Tablet Portrait',
				direction: 'max',
			},
			mobile: {
				is_enabled: true,
				value: 767,
				label: 'Mobile Portrait',
				direction: 'max',
			},
			widescreen: {
				is_enabled: true,
				value: 2400,
				label: 'Widescreen',
				direction: 'min',
			},
		} );

		// Act.
		const { result } = renderHook( useBreakpoints );

		// Assert.
		expect( result.current ).toEqual( [
			{ id: 'widescreen', label: 'Widescreen', width: 2400, type: 'min-width' },
			{ id: 'desktop', label: 'Desktop' },
			{ id: 'tablet', label: 'Tablet Portrait', width: 1024, type: 'max-width' },
			{ id: 'mobile', label: 'Mobile Portrait', width: 767, type: 'max-width' },
		] );
	} );
} );
