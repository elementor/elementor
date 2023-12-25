import { renderHook } from '@testing-library/react-hooks';
import useRouteStatus from '../use-route-status';
import { mockGetCurrentEditMode, mockIsRouteActive } from './test-utils';

describe( '@elementor/v1-adapters - useRouteStatus', () => {
	it.each( [
		{
			input: {
				isRouteActive: true,
				isKitRouteActive: false,
				isPreviewMode: false,
				options: {},
			},
			expected: true,
		},
		{
			input: {
				isRouteActive: true,
				isKitRouteActive: false,
				isPreviewMode: true,
				options: {
					blockOnPreviewMode: false,
				},
			},
			expected: true,
		},
		{
			input: {
				isRouteActive: false,
				isKitRouteActive: false,
				isPreviewMode: false,
				options: {},
			},
			expected: false,
		},
		{
			input: {
				isRouteActive: true,
				isKitRouteActive: false,
				isPreviewMode: true,
				options: {},
			},
			expected: false,
		},
	] )( 'should check if the route is active: isRouteActive = $input.isRouteActive, isPreviewMode = $input.isPreviewMode, options: $input.options', ( {
		input: { isRouteActive, isKitRouteActive, isPreviewMode, options },
		expected,
	} ) => {
		// Arrange
		mockIsRouteActive( ( route ) => route === 'panel/global' ? isKitRouteActive : isRouteActive );
		mockGetCurrentEditMode( () => isPreviewMode ? 'preview' : 'edit' );

		// Act.
		const { result } = renderHook( () => useRouteStatus( 'panel/page-settings', options ) );

		// Assert.
		expect( result.current.isActive ).toBe( expected );
	} );

	it.each( [
		{
			input: {
				isRouteActive: false,
				isKitRouteActive: false,
				isPreviewMode: false,
				options: {},
			},
			expected: false,
		},
		{
			input: {
				isRouteActive: false,
				isKitRouteActive: false,
				isPreviewMode: true,
				options: {
					blockOnPreviewMode: false,
				},
			},
			expected: false,
		},
		{
			input: {
				isRouteActive: false,
				isKitRouteActive: true,
				isPreviewMode: false,
				options: {
					blockOnKitRoutes: false,
				},
			},
			expected: false,
		},
		{
			input: {
				isRouteActive: false,
				isKitRouteActive: true,
				isPreviewMode: false,
				options: {},
			},
			expected: true,
		},
		{
			input: {
				isRouteActive: false,
				isKitRouteActive: false,
				isPreviewMode: true,
				options: {},
			},
			expected: true,
		},
	] )( 'should check if the route is blocked: isKitRouteActive = $input.isKitRouteActive, isPreviewMode = $input.isPreviewMode, options: $input.options', ( {
		input: { isRouteActive, isKitRouteActive, isPreviewMode, options },
		expected,
	} ) => {
		// Arrange
		mockIsRouteActive( ( route ) => route === 'panel/global' ? isKitRouteActive : isRouteActive );
		mockGetCurrentEditMode( () => isPreviewMode ? 'preview' : 'edit' );

		// Act.
		const { result } = renderHook( () => useRouteStatus( 'panel/page-settings', options ) );

		// Assert.
		expect( result.current.isBlocked ).toBe( expected );
	} );
} );
