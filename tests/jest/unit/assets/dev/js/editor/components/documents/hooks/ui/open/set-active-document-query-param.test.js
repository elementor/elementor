import { mockLocation, runHook } from '../../utils';

describe( `$e.run( 'editor/documents/open' ) -- SetActiveDocumentQueryParam`, () => {
	let SetActiveDocumentQueryParam;

	beforeEach( async () => {
		mockLocation();

		global.$e = {
			modules: {
				hookUI: {
					After: class {},
				},
			},
		};

		global.elementor = {
			config: {
				initial_document: {
					id: 1,
				},
			},
		};

		const HookClass = ( await import( 'elementor-editor/components/documents/hooks/ui/open/set-active-document-query-param' ) ).SetActiveDocumentQueryParam;

		SetActiveDocumentQueryParam = new HookClass();
	} );

	it( 'Should not run for the main document', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?some-param=test' );

		// Act.
		runHook( SetActiveDocumentQueryParam, { id: 1 } );

		// Assert.
		expect( window.location.href ).toBe( 'http://localhost/?some-param=test' );
	} );

	it( 'Should not change the query param when `args.id` is not a number', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?some-param=test' );

		// Act.
		runHook( SetActiveDocumentQueryParam, { id: 'test' } );

		// Assert.
		expect( window.location.href ).toBe( 'http://localhost/?some-param=test' );
	} );

	it( 'Should set the `active-document` query param to the currently opened document id', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?some-param=test' );

		// Act.
		runHook( SetActiveDocumentQueryParam, { id: 2 } );

		// Assert.
		expect( window.location.href ).toBe( 'http://localhost/?some-param=test&active-document=2' );
	} );

	it( 'Should override the `active-document` query param if it already exists', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?active-document=3' );

		// Act.
		runHook( SetActiveDocumentQueryParam, { id: 2 } );

		// Assert.
		expect( window.location.href ).toBe( 'http://localhost/?active-document=2' );
	} );
} );
