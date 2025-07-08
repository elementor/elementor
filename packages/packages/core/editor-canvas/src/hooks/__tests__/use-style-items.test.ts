import { createMockStyleDefinition, createMockStyleDefinitionWithVariants, createMockStylesProvider } from 'test-utils';
import { type StyleDefinition } from '@elementor/editor-styles';
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

jest.mock( '@elementor/editor-responsive', () => ( {
	getBreakpoints: jest.fn().mockReturnValue( [
		{ id: 'desktop', label: 'Desktop' },
		{ id: 'tablet', label: 'Tablet' },
		{ id: 'mobile', label: 'Mobile' },
	] ),
} ) );

describe( 'useStyleItems', () => {
	beforeEach( () => {
		jest.mocked( useStyleRenderer ).mockReturnValue(
			jest.fn().mockImplementation( ( { styles } ) =>
				styles.map( ( style: StyleDefinition ) => ( {
					id: style.id,
					breakpoint: style?.variants[ 0 ]?.meta.breakpoint || 'desktop',
				} ) )
			)
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
		expect( result.current ).toEqual( [
			{ id: 'style2', breakpoint: 'desktop' },
			{ id: 'style1', breakpoint: 'desktop' },
		] );

		// Act.
		await act( async () => {
			mockProvider2.actions.updateProps?.( {
				id: 'style3',
				meta: { breakpoint: null, state: null },
				props: { a: 1 },
			} );
		} );

		// Assert.
		expect( result.current ).toEqual( [
			{ id: 'style4', breakpoint: 'desktop' },
			{ id: 'style3', breakpoint: 'desktop' },
			{ id: 'style2', breakpoint: 'desktop' },
			{ id: 'style1', breakpoint: 'desktop' },
		] );
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
		expect( result.current ).toEqual( [
			{ id: 'style4', breakpoint: 'desktop' },
			{ id: 'style3', breakpoint: 'desktop' },
			{ id: 'style2', breakpoint: 'desktop' },
			{ id: 'style1', breakpoint: 'desktop' },
		] );
	} );

	it( 'should return style items ordered by provider priority and breakpoint', async () => {
		// Arrange.
		const mockProvider1 = createMockStylesProvider(
			{
				key: 'provider1',
				priority: 2,
			},
			[
				createMockStyleDefinitionWithVariants( {
					id: 'style1',
					variants: [
						{
							meta: { breakpoint: 'mobile', state: null },
							props: {
								padding: '10px',
							},
						},
						{
							meta: { breakpoint: 'mobile', state: 'hover' },
							props: {
								padding: '20px',
							},
						},
					],
				} ),
				createMockStyleDefinition( { id: 'style2' } ),
			]
		);

		const mockProvider2 = createMockStylesProvider(
			{
				key: 'provider2',
				priority: 1,
			},
			[
				createMockStyleDefinition( { id: 'style3', meta: { breakpoint: 'tablet', state: null } } ),
				createMockStyleDefinition( { id: 'style4' } ),
			]
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
		expect( result.current ).toEqual( [
			{ id: 'style4', breakpoint: 'desktop' },
			{ id: 'style2', breakpoint: 'desktop' },
			{ id: 'style3', breakpoint: 'tablet' },
			{ id: 'style1', breakpoint: 'mobile' },
		] );
	} );
} );
