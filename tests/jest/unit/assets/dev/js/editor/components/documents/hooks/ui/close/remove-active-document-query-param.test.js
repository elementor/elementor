import { mockLocation, runHook } from '../../utils';

describe( `$e.run( 'editor/documents/close' ) -- RemoveActiveDocumentQueryParam`, () => {
	let RemoveActiveDocumentQueryParam;

	beforeEach( async () => {
		mockLocation();

		global.$e = {
			modules: {
				hookUI: {
					After: class {},
				},
			},
		};

		const HookClass = ( await import( 'elementor-editor/components/documents/hooks/ui/close/remove-active-document-query-param' ) ).RemoveActiveDocumentQueryParam;

		RemoveActiveDocumentQueryParam = new HookClass();
	} );

	it( 'Should not remove the query param when closing another document then the `active-document`', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?active-document=1' );

		// Act.
		runHook( RemoveActiveDocumentQueryParam, { id: 2 } );

		// Assert.
		expect( window.location.href ).toBe( 'http://localhost/?active-document=1' );
	} );

	it( 'Should remove the query param when closing the `active-document`', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?active-document=1&other-param=test#hash' );

		// Act.
		runHook( RemoveActiveDocumentQueryParam, { id: 1 } );

		// Assert.
		expect( window.location.href ).toBe( 'http://localhost/?other-param=test#hash' );
	} );

	it( 'Should remove the query param when `args.id` passed as a string', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?active-document=1&other-param=test#hash' );

		// Act.
		runHook( RemoveActiveDocumentQueryParam, { id: '1' } );

		// Assert.
		expect( window.location.href ).toBe( 'http://localhost/?other-param=test#hash' );
	} );
} );
