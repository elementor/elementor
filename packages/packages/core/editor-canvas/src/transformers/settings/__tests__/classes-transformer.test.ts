import { createClassesTransformer } from '../classes-transformer';

jest.mock( '@elementor/editor-styles-repository', () => ( {
	stylesRepository: {
		getProviders: jest.fn(),
		getProviderByKey: jest.fn(),
	},
} ) );

const mockStylesRepository = require( '@elementor/editor-styles-repository' ).stylesRepository;

describe( 'createClassesTransformer', () => {
	const createMockProvider = ( key: string, styles: Array< { id: string } > = [] ) => ( {
		getKey: () => key,
		actions: {
			all: () => styles,
			resolveCssName: jest.fn( ( id: string ): string | null => `resolved-${ id }` ),
		},
	} );

	const createMockStyle = ( id: string ) => ( { id } );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should transform class IDs using provider CSS names', () => {
		const provider = createMockProvider( 'test-provider', [ createMockStyle( 'class-1' ) ] );
		const provider2 = createMockProvider( 'test-provider-2', [ createMockStyle( 'class-2' ) ] );
		mockStylesRepository.getProviders.mockReturnValue( [ provider, provider2 ] );
		mockStylesRepository.getProviderByKey.mockReturnValueOnce( provider ).mockReturnValueOnce( provider2 );
		const transformer = createClassesTransformer();

		const result = transformer( [ 'class-1', 'class-2' ], { key: 'test-key' } );

		expect( result ).toEqual( [ 'resolved-class-1', 'resolved-class-2' ] );
		expect( provider.actions.resolveCssName ).toHaveBeenCalledWith( 'class-1' );
	} );

	it( 'should return original ID when no provider is found', () => {
		mockStylesRepository.getProviders.mockReturnValue( [] );
		const transformer = createClassesTransformer();

		const result = transformer( [ 'unknown-class' ], { key: 'test-key' } );

		expect( result ).toEqual( [ 'unknown-class' ] );
	} );

	it( 'should return original ID when provider has no matching style', () => {
		const provider = createMockProvider( 'test-provider', [ createMockStyle( 'other-class' ) ] );
		mockStylesRepository.getProviders.mockReturnValue( [ provider ] );
		const transformer = createClassesTransformer();

		const result = transformer( [ 'unknown-class' ], { key: 'test-key' } );

		expect( result ).toEqual( [ 'unknown-class' ] );
	} );

	it( 'should cache provider keys to avoid repeated lookups', () => {
		const provider = createMockProvider( 'test-provider', [ createMockStyle( 'class-1' ) ] );
		mockStylesRepository.getProviders.mockReturnValue( [ provider ] );
		mockStylesRepository.getProviderByKey.mockReturnValue( provider );
		const transformer = createClassesTransformer();

		transformer( [ 'class-1' ], { key: 'test-key' } );
		transformer( [ 'class-1' ], { key: 'test-key' } );

		expect( mockStylesRepository.getProviders ).toHaveBeenCalledTimes( 1 );
		expect( provider.actions.resolveCssName ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should handle multiple class IDs', () => {
		const provider1 = createMockProvider( 'provider-1', [ createMockStyle( 'class-1' ) ] );
		const provider2 = createMockProvider( 'provider-2', [ createMockStyle( 'class-2' ) ] );
		mockStylesRepository.getProviders.mockReturnValue( [ provider1, provider2 ] );
		mockStylesRepository.getProviderByKey.mockReturnValueOnce( provider1 ).mockReturnValueOnce( provider2 );
		const transformer = createClassesTransformer();

		const result = transformer( [ 'class-1', 'class-2' ], { key: 'test-key' } );

		expect( result ).toEqual( [ 'resolved-class-1', 'resolved-class-2' ] );
	} );
} );
