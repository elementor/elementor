import { renderHook } from '@testing-library/react-hooks';
import { Settings, SettingsContextProvider, useSettings } from '../settings-context';

describe( '@elementor/editor - useSettings()', () => {
	it( 'should return the value from the context', () => {
		// Act.
		const { result } = renderHookWithSettings(
			() => useSettings(),
			{
				urls: {
					admin: 'https://localhost/wp-admin/',
				},
			}
		);

		// Assert.
		expect( result.current ).toEqual( {
			urls: {
				admin: 'https://localhost/wp-admin/',
			},
		} );
	} );

	it( 'should throw when not rendered inside a <SettingsContextProvider />', () => {
		// Arrange.
		// Mock the `console.error` because `@testing-library/react-hooks` takes over the `console.error`
		// which breaks `@wordpress/jest-console` assertions.

		// eslint-disable-next-line no-console
		console.error = jest.fn();

		// Act.
		const { result } = renderHook( () => useSettings() );

		// Assert.
		expect( result.error?.message ).toEqual( 'The `useSettings()` hook must be used within an `<SettingsContextProvider />`' );
	} );
} );

function renderHookWithSettings( hook: () => unknown, settings: Settings ) {
	return renderHook( hook, {
		wrapper: ( { children } ) => {
			return (
				<SettingsContextProvider settings={ settings }>
					{ children }
				</SettingsContextProvider>
			);
		},
	} );
}
