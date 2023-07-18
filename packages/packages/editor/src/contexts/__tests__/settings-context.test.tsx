import { renderHook } from '@testing-library/react-hooks';
import { Settings, SettingsProvider, useSettings } from '../settings-context';

describe( '@elementor/editor - useSettings()', () => {
	it( 'should return the value from the context', () => {
		// Arrange.
		const settings = {
			urls: {
				admin: 'https://localhost/wp-admin/',
			},
		};

		// Act.
		const { result } = renderHookWithSettings(
			() => useSettings(),
			settings
		);

		// Assert.
		expect( result.current ).toEqual( settings );
	} );

	it( 'should throw when not rendered inside a <SettingsProvider />', () => {
		// Arrange.
		// Mock the `console.error` because `@testing-library/react-hooks` takes over the `console.error`
		// which breaks `@wordpress/jest-console` assertions.

		// eslint-disable-next-line no-console
		console.error = jest.fn();

		// Act.
		const { result } = renderHook( () => useSettings() );

		// Assert.
		expect( result.error?.message ).toEqual( 'The `useSettings()` hook must be used within an `<SettingsProvider />`' );
	} );
} );

function renderHookWithSettings( hook: () => unknown, settings: Settings ) {
	return renderHook( hook, {
		wrapper: ( { children } ) => {
			return (
				<SettingsProvider settings={ settings }>
					{ children }
				</SettingsProvider>
			);
		},
	} );
}
