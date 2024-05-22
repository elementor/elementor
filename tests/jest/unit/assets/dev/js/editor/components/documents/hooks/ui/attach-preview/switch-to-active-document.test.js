import { mockLocation, runHook } from 'elementor/tests/jest/unit/assets/dev/js/editor/components/documents/hooks/utils';

describe( `$e.internal( 'editor/documents/attach-preview' ) -- SwitchToActiveDocument`, () => {
	let SwitchToActiveDocument;

	beforeEach( async () => {
		global.$e = {
			modules: {
				hookUI: {
					After: class {},
				},
			},
			run: jest.fn( () => Promise.resolve() ),
		};

		global.elementor = {
			documents: {
				getCurrentId: jest.fn(),
			},
			config: {
				initial_document: {
					id: 1,
				},
			},
		};

		mockLocation();

		const HookClass = ( await import( 'elementor-editor/components/documents/hooks/ui/attach-preview/switch-to-active-document' ) ).SwitchToActiveDocument;

		SwitchToActiveDocument = new HookClass();
	} );

	afterEach( () => {
		jest.clearAllMocks();

		SwitchToActiveDocument.constructor.calledOnce = false;
	} );

	it( 'Should run only once', async () => {
		// Arrange.
		elementor.documents.getCurrentId.mockReturnValue( 1 );
		window.location = new URL( 'http://localhost/?active-document=2' );

		// Act.
		await runHook( SwitchToActiveDocument );
		await runHook( SwitchToActiveDocument );
		await runHook( SwitchToActiveDocument );

		// Assert.
		expect( $e.run ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'Should not run when switching from the non-initial document', async () => {
		// Arrange.
		elementor.documents.getCurrentId.mockReturnValue( 2 );

		// Act.
		await runHook( SwitchToActiveDocument, { id: 3 } );

		// Assert.
		expect( $e.run ).not.toHaveBeenCalled();
	} );

	it( 'Should not run when there is no `active-document` query param', async () => {
		// Arrange.
		elementor.documents.getCurrentId.mockReturnValue( 1 );
		window.location = new URL( 'http://localhost/' );

		// Act.
		await runHook( SwitchToActiveDocument );

		// Assert.
		expect( $e.run ).not.toHaveBeenCalled();
	} );

	it( 'Should not run when the `active-document` query param is not a number', async () => {
		// Arrange.
		elementor.documents.getCurrentId.mockReturnValue( 1 );
		window.location = new URL( 'http://localhost/?active-document=test' );

		// Act.
		await runHook( SwitchToActiveDocument );

		// Assert.
		expect( $e.run ).not.toHaveBeenCalled();
	} );

	it( 'Should not run when the `active-document` query param is the currently loaded one', async () => {
		// Arrange.
		elementor.documents.getCurrentId.mockReturnValue( 1 );
		window.location = new URL( 'http://localhost/?active-document=1' );

		// Act.
		await runHook( SwitchToActiveDocument );

		// Assert.
		expect( $e.run ).not.toHaveBeenCalled();
	} );

	it( 'Should switch to the `active-document` and keep the query param', async () => {
		// Arrange.
		elementor.documents.getCurrentId.mockReturnValue( 1 );
		window.location = new URL( 'http://localhost/?active-document=2' );

		// Act.;
		await runHook( SwitchToActiveDocument );

		// Assert.
		expect( $e.run ).toHaveBeenCalledTimes( 1 );
		expect( $e.run ).toHaveBeenCalledWith( 'editor/documents/switch', {
			id: 2,
			mode: 'autosave',
		} );

		expect( window.location.href ).toBe( 'http://localhost/?active-document=2' );
	} );

	it( 'Should fallback to the main document and remove the query param when the `active-document` can\'t be loaded', async () => {
		// Arrange.
		elementor.documents.getCurrentId.mockReturnValue( 1 );
		window.location = new URL( 'http://localhost/?active-document=2&other-param=test' );

		$e.run.mockImplementationOnce( () => Promise.reject() );

		// Act.
		await runHook( SwitchToActiveDocument );

		// Assert.
		expect( $e.run ).toHaveBeenCalledTimes( 2 );

		expect( $e.run ).toHaveBeenNthCalledWith( 1, 'editor/documents/switch', {
			id: 2,
			mode: 'autosave',
		} );

		expect( $e.run ).toHaveBeenNthCalledWith( 2, 'editor/documents/switch', {
			id: 1,
			mode: 'autosave',
		} );

		expect( window.location.href ).toBe( 'http://localhost/?other-param=test' );
	} );
} );
