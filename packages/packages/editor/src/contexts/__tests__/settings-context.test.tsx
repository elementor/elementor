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
