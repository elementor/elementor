import {
	isDeletedIconLibrary,
	registerIconLibraryProvider,
	resolveProviderIconSvg,
	unregisterIconLibraryProvider,
} from '../icon-library-providers';

const PROVIDER_ID = 'test-provider';

describe( 'icon-library-providers', () => {
	afterEach( () => {
		unregisterIconLibraryProvider( PROVIDER_ID );
	} );

	it( 'should resolve null when no provider is registered', async () => {
		// Act.
		const markup = await resolveProviderIconSvg( 'my-icons', 'my-icons badge' );

		// Assert.
		expect( markup ).toBeNull();
		expect( isDeletedIconLibrary( 'my-icons', 'my-icons badge' ) ).toBe( false );
	} );

	it( 'should resolve svg markup from a registered provider', async () => {
		// Arrange.
		registerIconLibraryProvider( {
			id: PROVIDER_ID,
			useIcons: () => ( { data: [], isLoading: false } ),
			resolveSvg: async () => '<svg></svg>',
			isDeletedLibrary: ( library ) => 'gone' === library,
		} );

		// Act.
		const markup = await resolveProviderIconSvg( 'my-icons', 'my-icons badge' );

		// Assert.
		expect( markup ).toBe( '<svg></svg>' );
		expect( isDeletedIconLibrary( 'gone', 'gone x' ) ).toBe( true );
	} );
} );
