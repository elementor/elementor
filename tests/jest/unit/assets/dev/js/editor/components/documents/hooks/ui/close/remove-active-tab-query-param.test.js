import { mockLocation, runHook } from '../../utils';

describe( `$e.run( 'editor/documents/close' ) -- RemoveActiveTabQueryParam`, () => {
	let RemoveActiveTabQueryParam;

	beforeEach( async () => {
		mockLocation();

		global.$e = {
			modules: {
				hookUI: {
					After: class {},
				},
			},
		};

		const HookClass = ( await import( 'elementor-editor/components/documents/hooks/ui/close/remove-active-tab-query-param' ) ).RemoveActiveTabQueryParam;

		RemoveActiveTabQueryParam = new HookClass();
	} );

	it( 'Should remove the query param when closing the `active-document`', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?active-document=1&active-tab=global-typography&other-param=test#hash' );

		// Act.
		runHook( RemoveActiveTabQueryParam, { id: 3, previous_active_document_id: 3 } );

		// Assert.
		expect( window.location.href ).toBe( 'http://localhost/?other-param=test#hash' );
	} );
} );
