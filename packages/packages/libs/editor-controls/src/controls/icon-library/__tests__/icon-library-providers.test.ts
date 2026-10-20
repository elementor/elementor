import { renderHook } from '@testing-library/react';

import {
	registerIconLibraryProvider,
	resolveProviderIconPreviewSvg,
	resolveProviderIconSvg,
	unregisterIconLibraryProvider,
	useIconLibraryProviderIcons,
} from '../icon-library-providers';
import { mergeIconsById } from '../merge-icons-by-id';

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

	describe( 'resolveProviderIconPreviewSvg', () => {
		it( 'should prefer resolvePreviewSvg over resolveSvg', async () => {
			// Arrange.
			const resolveSvg = jest.fn().mockResolvedValue( '<svg id="full"></svg>' );
			registerIconLibraryProvider( {
				id: PROVIDER_ID,
				useIcons: emptyIcons,
				resolvePreviewSvg: async () => '<svg id="preview"></svg>',
				resolveSvg,
			} );

			// Act.
			const markup = await resolveProviderIconPreviewSvg( 'fa-light', 'fal fa-star' );

			// Assert.
			expect( markup ).toBe( '<svg id="preview"></svg>' );
			expect( resolveSvg ).not.toHaveBeenCalled();
		} );

		it( 'should fall back to resolveSvg when the provider has no preview resolver', async () => {
			// Arrange.
			registerIconLibraryProvider( {
				id: PROVIDER_ID,
				useIcons: emptyIcons,
				resolveSvg: async () => '<svg id="full"></svg>',
			} );

			// Act.
			const markup = await resolveProviderIconPreviewSvg( 'fa-light', 'fal fa-star' );

			// Assert.
			expect( markup ).toBe( '<svg id="full"></svg>' );
		} );

		it( 'should resolve null when no provider is registered', async () => {
			// Act.
			const markup = await resolveProviderIconPreviewSvg( 'fa-light', 'fal fa-star' );

			// Assert.
			expect( markup ).toBeNull();
		} );
	} );

	describe( 'mergeIconsById', () => {
		const icon = ( id: string, label: string ) =>
			( {
				id,
				label,
				name: id,
				library: 'fa-solid',
				value: id,
				aliases: [],
				width: 1,
				height: 1,
				paths: [],
			} ) as never;

		it( 'should keep the primary icon when both lists contain the same id', () => {
			// Arrange.
			const primary = [ icon( 'fa-solid:star', 'core' ) ];
			const secondary = [ icon( 'fa-solid:star', 'provider' ), icon( 'fa-light:star', 'light' ) ];

			// Act.
			const merged = mergeIconsById( primary, secondary );

			// Assert.
			expect( merged.map( ( item: { id: string; label: string } ) => [ item.id, item.label ] ) ).toEqual( [
				[ 'fa-solid:star', 'core' ],
				[ 'fa-light:star', 'light' ],
			] );
		} );
	} );

	describe( 'useIconLibraryProviderIcons', () => {
		const icon = {
			id: 'x:a',
			name: 'a',
			label: 'a',
			library: 'x',
			value: 'x a',
			aliases: [],
			width: 1,
			height: 1,
			paths: [],
		};

		it( 'keeps the same list while providers return the same data', () => {
			// Arrange.
			const data = [ icon ];

			registerIconLibraryProvider( { id: PROVIDER_ID, useIcons: () => ( { data, isLoading: false } ) } );

			// Act.
			const { result, rerender } = renderHook( () => useIconLibraryProviderIcons( true ) );
			const first = result.current.data;

			rerender();

			// Assert.
			expect( result.current.data ).toBe( first );
		} );

		it( 'reports loading when any provider loads and merges every provider list', () => {
			// Arrange.
			registerIconLibraryProvider( {
				id: PROVIDER_ID,
				useIcons: () => ( { data: [ icon ], isLoading: false } ),
			} );
			registerIconLibraryProvider( {
				id: FAILING_PROVIDER_ID,
				useIcons: () => ( { data: undefined, isLoading: true } ),
			} );

			// Act.
			const { result } = renderHook( () => useIconLibraryProviderIcons( true ) );

			// Assert.
			expect( result.current.data ).toEqual( [ icon ] );
			expect( result.current.isLoading ).toBe( true );
		} );
	} );
} );
