import {
	registerIconLibraryProvider,
	resolveProviderIconSvg,
	unregisterIconLibraryProvider,
} from '../icon-library-providers';

const PROVIDER_ID = 'test-provider';
const FAILING_PROVIDER_ID = 'failing-provider';

const emptyIcons = () => ( { data: [], isLoading: false } );

describe( 'icon-library-providers', () => {
	afterEach( () => {
		unregisterIconLibraryProvider( PROVIDER_ID );
		unregisterIconLibraryProvider( FAILING_PROVIDER_ID );
	} );

	it( 'should resolve null when no provider is registered', async () => {
		// Act.
		const markup = await resolveProviderIconSvg( 'my-icons', 'my-icons badge' );

		// Assert.
		expect( markup ).toBeNull();
	} );

	it( 'should resolve svg markup from a registered provider', async () => {
		// Arrange.
		registerIconLibraryProvider( {
			id: PROVIDER_ID,
			useIcons: emptyIcons,
			resolveSvg: async () => '<svg></svg>',
		} );

		// Act.
		const markup = await resolveProviderIconSvg( 'my-icons', 'my-icons badge' );

		// Assert.
		expect( markup ).toBe( '<svg></svg>' );
	} );

	it( 'should skip a provider that throws and use the next one', async () => {
		// Arrange.
		registerIconLibraryProvider( {
			id: FAILING_PROVIDER_ID,
			useIcons: emptyIcons,
			resolveSvg: async () => {
				throw new Error( 'network' );
			},
		} );
		registerIconLibraryProvider( {
			id: PROVIDER_ID,
			useIcons: emptyIcons,
			resolveSvg: async () => '<svg></svg>',
		} );

		// Act.
		const markup = await resolveProviderIconSvg( 'my-icons', 'my-icons badge' );

		// Assert.
		expect( markup ).toBe( '<svg></svg>' );
	} );

	it( 'should rethrow when the request was aborted', async () => {
		// Arrange.
		const controller = new AbortController();
		controller.abort();
		registerIconLibraryProvider( {
			id: FAILING_PROVIDER_ID,
			useIcons: emptyIcons,
			resolveSvg: async () => {
				throw new Error( 'aborted' );
			},
		} );

		// Act & Assert.
		await expect( resolveProviderIconSvg( 'my-icons', 'my-icons badge', controller.signal ) ).rejects.toThrow(
			'aborted'
		);
	} );
} );
