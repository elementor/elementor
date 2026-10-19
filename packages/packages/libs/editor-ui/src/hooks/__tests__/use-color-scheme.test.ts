import { act, renderHook } from '@testing-library/react';

import { type ColorScheme, type ExtendedWindow, useColorScheme } from '../use-color-scheme';

describe( '@elementor/editor - useColorScheme', () => {
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
		mockV1ColorScheme( 'auto' );

		const { result } = renderHook( () => useColorScheme() );

		// Assert - Before change.
		expect( result.current ).toBe( 'auto' );

		// Act - Change.
		act( () => {
			mockV1ColorScheme( 'dark' );

			dispatchEvent(
				new CustomEvent( 'elementor/commands/run/after', {
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
				} )
			);
		} );

		// Assert.
		expect( result.current ).toBe( 'dark' );
	} );

	it( 'should not sync color scheme on unrelated commands', () => {
		// Act.
		const { result } = renderHook( () => useColorScheme() );

		act( () => {
			dispatchEvent(
				new CustomEvent( 'elementor/commands/run/after', {
					detail: {
						command: 'document/elements/settings',
						args: {
							container: {
								id: 'some_other_container',
							},
						},
					},
				} )
			);
		} );

		// Assert.
		expect( result.current ).toBe( 'auto' );
	} );

	describe( 'static color scheme', () => {
		it( 'should use the static color scheme over the V1 preference', () => {
			// Arrange.
			mockV1ColorScheme( 'light' );

			// Act.
			const { result } = renderHook( () => useColorScheme( 'dark' ) );

			// Assert.
			expect( result.current ).toBe( 'dark' );
		} );

		it( 'should follow the V1 preference when no static color scheme is provided', () => {
			// Arrange.
			mockV1ColorScheme( 'light' );

			// Act.
			const { result } = renderHook( () => useColorScheme( undefined ) );

			// Assert.
			expect( result.current ).toBe( 'light' );
		} );

		it( 'should keep the static color scheme on V1 ready', () => {
			// Arrange.
			mockV1ColorScheme( 'light' );

			const { result } = renderHook( () => useColorScheme( 'dark' ) );

			// Act.
			act( () => {
				dispatchEvent( new CustomEvent( 'elementor/initialized' ) );
			} );

			// Assert.
			expect( result.current ).toBe( 'dark' );
		} );

		it( 'should keep the static color scheme on V1 preference change', () => {
			// Arrange.
			mockV1ColorScheme( 'light' );

			const { result } = renderHook( () => useColorScheme( 'dark' ) );

			// Act.
			act( () => {
				mockV1ColorScheme( 'auto' );

				dispatchEvent(
					new CustomEvent( 'elementor/commands/run/after', {
						detail: {
							command: 'document/elements/settings',
							args: {
								container: {
									id: 'editorPreferences_settings',
								},
								settings: {
									ui_theme: 'auto',
								},
							},
						},
					} )
				);
			} );

			// Assert.
			expect( result.current ).toBe( 'dark' );
		} );

		it( 'should update the result when the static color scheme changes', () => {
			// Arrange.
			mockV1ColorScheme( 'light' );

			const { result, rerender } = renderHook(
				( { staticColorScheme }: { staticColorScheme?: ColorScheme } ) => useColorScheme( staticColorScheme ),
				{ initialProps: { staticColorScheme: 'dark' as ColorScheme | undefined } }
			);

			// Assert - Before change.
			expect( result.current ).toBe( 'dark' );

			// Act - Change to another static value.
			rerender( { staticColorScheme: 'auto' } );

			// Assert.
			expect( result.current ).toBe( 'auto' );

			// Act - Remove the static value.
			rerender( { staticColorScheme: undefined } );

			// Assert.
			expect( result.current ).toBe( 'light' );
		} );
	} );
} );

function mockV1ColorScheme( colorScheme: ColorScheme ) {
	( window as unknown as ExtendedWindow ).elementor = {
		getPreferences: () => colorScheme,
	};
}
