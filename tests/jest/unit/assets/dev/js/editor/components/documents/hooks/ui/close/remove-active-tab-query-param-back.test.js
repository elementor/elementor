import { mockLocation, runHook } from '../../utils';

describe( `$e.run( 'panel/global/back' ) -- RemoveActiveTabQueryParamBack`, () => {
	let RemoveActiveTabQueryParamBack;

	beforeEach( async () => {
		mockLocation();

		global.$e = {
			modules: {
				hookUI: {
					After: class {},
				},
			},
		};

		const HookClass = ( await import( 'elementor-editor/components/documents/hooks/ui/close/remove-active-tab-query-param-back' ) ).RemoveActiveTabQueryParamBack;

		RemoveActiveTabQueryParamBack = new HookClass();
	} );

	it( 'Should remove the query param when clicking back', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?active-document=1&active-tab=global-typography&other-param=test#hash' );

		// Act.
		runHook( RemoveActiveTabQueryParamBack, {} );

		// Assert.
		expect( window.location.href ).toBe( 'http://localhost/?active-document=1&other-param=test#hash' );
	} );
} );
