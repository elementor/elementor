import { createMockStyleDefinition, createMockStylesProvider } from 'test-utils';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { act, renderHook } from '@testing-library/react';

import { useStyleItems } from '../use-style-items';
import { useStyleRenderer } from '../use-style-renderer';

jest.mock( '@elementor/editor-styles-repository', () => ( {
	...jest.requireActual( '@elementor/editor-styles-repository' ),
	stylesRepository: {
		getProviders: jest.fn(),
	},
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	registerDataHook: jest.fn(),
} ) );

jest.mock( '../use-style-prop-resolver', () => ( {
	useStylePropResolver: jest.fn(),
} ) );

jest.mock( '../use-style-renderer', () => ( {
	useStyleRenderer: jest.fn(),
} ) );

describe( 'useStyleItems', () => {
	beforeEach( () => {
		jest.mocked( useStyleRenderer ).mockReturnValue(
			jest
				.fn()
				.mockImplementation( ( { styles } ) => styles.map( ( style: { id: string } ) => ( { id: style.id } ) ) )
		);
	} );

	it( 'should return style items from providers when subscribed', async () => {
		// Arrange.
		const mockProvider1 = createMockStylesProvider(
			{
				key: 'provider1',
				priority: 2,
			},
			[ createMockStyleDefinition( { id: 'style1' } ), createMockStyleDefinition( { id: 'style2' } ) ]
		);

		const mockProvider2 = createMockStylesProvider(
			{
				key: 'provider2',
				priority: 1,
			},
			[ createMockStyleDefinition( { id: 'style3' } ), createMockStyleDefinition( { id: 'style4' } ) ]
		);

		jest.mocked( stylesRepository ).getProviders.mockReturnValue( [ mockProvider1, mockProvider2 ] );

		// Act.
		const { result } = renderHook( () => useStyleItems() );

		// Assert.
		expect( result.current ).toEqual( [] );

		// Act.
		await act( async () => {
			mockProvider1.actions.updateProps?.( {
				id: 'style1',
				meta: { breakpoint: null, state: null },
				props: { a: 1 },
			} );
		} );

		// Assert.
		expect( result.current ).toEqual( [ { id: 'style2' }, { id: 'style1' } ] );

		// Act.
		await act( async () => {
			mockProvider2.actions.updateProps?.( {
				id: 'style3',
				meta: { breakpoint: null, state: null },
				props: { a: 1 },
			} );
		} );

		// Assert.
		expect( result.current ).toEqual( [ { id: 'style4' }, { id: 'style3' }, { id: 'style2' }, { id: 'style1' } ] );
	} );

	it( 'should return style items when attach-preview command is triggered', async () => {
		// Arrange.
		const mockProvider1 = createMockStylesProvider(
			{
				key: 'provider1',
				priority: 2,
			},
			[ createMockStyleDefinition( { id: 'style1' } ), createMockStyleDefinition( { id: 'style2' } ) ]
		);

		const mockProvider2 = createMockStylesProvider(
			{
				key: 'provider2',
				priority: 1,
			},
			[ createMockStyleDefinition( { id: 'style3' } ), createMockStyleDefinition( { id: 'style4' } ) ]
		);

		jest.mocked( stylesRepository ).getProviders.mockReturnValue( [ mockProvider1, mockProvider2 ] );

		let attachPreviewCallback: () => Promise< void >;

		jest.mocked( registerDataHook ).mockImplementation( ( position, command, callback ) => {
			if ( command === 'editor/documents/attach-preview' && position === 'after' ) {
				attachPreviewCallback = callback as never;
			}

			return null as never;
		} );

		// Act.
		const { result } = renderHook( () => useStyleItems() );

		// Assert.
		expect( result.current ).toEqual( [] );

		// Act.
		await act( async () => {
			await attachPreviewCallback?.();
		} );

		// Assert.
		expect( result.current ).toEqual( [ { id: 'style4' }, { id: 'style3' }, { id: 'style2' }, { id: 'style1' } ] );
	} );
} );
