import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import useThemeBuilderActionProps from '../use-action-props';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommand: jest.fn(),
} ) );

describe( '@elementor/editor-app-bar - useThemeBuilderActionProps', () => {
	const menuUrl = 'http://example.com/wp-admin/admin.php?page=elementor-app#/theme-builder';
	const command = 'app/open';

	beforeEach( () => {
		window.elementorAppConfig = { menu_url: menuUrl };
		window.elementorCommon = {
			config: {},
			eventsManager: {
				dispatchEvent: jest.fn(),
				config: null,
			},
		} as unknown as typeof window.elementorCommon;

		Object.defineProperty( window.top, 'location', {
			writable: true,
			value: '',
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should open the theme builder', () => {
		const { result } = renderHook( () => useThemeBuilderActionProps() );
		result.current.onClick?.();

		expect( runCommand ).toBeCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( command );
	} );

	it( 'should navigate full page when theme_builder_v2 is registered and inactive', () => {
		window.elementorCommon = {
			config: {
				allExperimentalFeatures: {
					theme_builder_v2: false,
				},
			},
			eventsManager: {
				dispatchEvent: jest.fn(),
				config: null,
			},
		} as unknown as typeof window.elementorCommon;

		const { result } = renderHook( () => useThemeBuilderActionProps() );
		result.current.onClick?.();

		expect( window.top?.location ).toBe( menuUrl );
		expect( runCommand ).not.toHaveBeenCalled();
	} );

	it( 'should run app/open when theme_builder_v2 is active', () => {
		window.elementorCommon = {
			config: {
				allExperimentalFeatures: {
					theme_builder_v2: true,
				},
			},
			eventsManager: {
				dispatchEvent: jest.fn(),
				config: null,
			},
		} as unknown as typeof window.elementorCommon;

		const { result } = renderHook( () => useThemeBuilderActionProps() );
		result.current.onClick?.();

		expect( runCommand ).toHaveBeenCalledWith( command );
		expect( window.top?.location ).toBe( '' );
	} );
} );
