import { act, renderHook } from '@testing-library/react-hooks';
import { ColorScheme, ExtendedWindow, useColorScheme } from '../theme-provider';

describe( '@elementor/editor - Theme provider', () => {
	it( 'should use the "auto" color scheme by default', () => {
		// Act.
		const { result } = renderHook( () => useColorScheme() );

		// Assert.
		expect( result.current ).toBe( 'auto' );
	} );

	it( 'should sync color scheme on V1 ready', () => {
		// Arrange.
		mockV1ColorScheme( 'dark' );

		// Act.
		const { result } = renderHook( () => useColorScheme() );

		act( () => {
			dispatchEvent( new CustomEvent( 'elementor/initialized' ) );
		} );

		// Assert.
		expect( result.current ).toBe( 'dark' );
	} );

	it( 'should sync color scheme on V1 change', () => {
		// Arrange.
		mockV1ColorScheme( 'dark' );

		// Act.
		const { result } = renderHook( () => useColorScheme() );

		act( () => {
			dispatchEvent( new CustomEvent( 'elementor/commands/run/after', {
				detail: {
					command: 'document/elements/settings',
					args: {
						container: {
							id: 'editorPreferences_settings',
						},
						settings: {
							ui_theme: 'dark',
						},
					},
				},
			} ) );
		} );

		// Assert.
		expect( result.current ).toBe( 'dark' );
	} );

	it( 'should not sync color scheme on unrelated commands', () => {
		// Act.
		const { result } = renderHook( () => useColorScheme() );

		act( () => {
			dispatchEvent( new CustomEvent( 'elementor/commands/run/after', {
				detail: {
					command: 'document/elements/settings',
					args: {
						container: {
							id: 'some_other_container',
						},
					},
				},
			} ) );
		} );

		// Assert.
		expect( result.current ).toBe( 'auto' );
	} );
} );

function mockV1ColorScheme( colorScheme: ColorScheme ) {
	( window as unknown as ExtendedWindow ).elementor = {
		settings: {
			editorPreferences: {
				model: {
					get: () => colorScheme,
				},
			},
		},
	};
}
