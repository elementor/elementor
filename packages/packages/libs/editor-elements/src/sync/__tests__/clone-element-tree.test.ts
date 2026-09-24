import { createMockElementData } from 'test-utils';

import { cloneElementTree } from '../clone-element-tree';

describe( 'cloneElementTree', () => {
	beforeEach( () => {
		( window as typeof window & {
			elementorCommon?: { helpers?: { getUniqueId?: jest.Mock } };
		} ).elementorCommon = {
			helpers: {
				getUniqueId: jest.fn(),
			},
		};
	} );

	afterEach( () => {
		delete ( window as typeof window & { elementorCommon?: unknown } ).elementorCommon;
	} );

	it( 'regenerates ids recursively and clears custom element ids', () => {
		// Arrange.
		( window as typeof window & {
			elementorCommon?: { helpers?: { getUniqueId?: jest.Mock } };
		} ).elementorCommon?.helpers?.getUniqueId
			?.mockReturnValueOnce( 'cloned-parent-id' )
			.mockReturnValueOnce( 'cloned-child-id' );

		const source = createMockElementData( {
			id: 'original-parent-id',
			settings: { _element_id: 'original-parent-element-id' } as never,
			elements: [
				createMockElementData( {
					id: 'original-child-id',
					settings: { _element_id: 'original-child-element-id' } as never,
				} ),
			],
		} );

		// Act.
		const cloned = cloneElementTree( source );

		// Assert.
		expect( cloned.id ).toBe( 'cloned-parent-id' );
		expect( cloned.settings?._element_id ).toBe( '' );
		expect( cloned.elements?.[ 0 ].id ).toBe( 'cloned-child-id' );
		expect( cloned.elements?.[ 0 ].settings?._element_id ).toBe( '' );
		expect( source.id ).toBe( 'original-parent-id' );
		expect( source.elements?.[ 0 ].id ).toBe( 'original-child-id' );
	} );

	it( 'regenerates ids recursively for Backbone model input', () => {
		// Arrange.
		( window as typeof window & {
			elementorCommon?: { helpers?: { getUniqueId?: jest.Mock } };
		} ).elementorCommon?.helpers?.getUniqueId
			?.mockReturnValueOnce( 'model-parent-id' )
			.mockReturnValueOnce( 'model-child-id' );

		const source = createMockElementData( {
			id: 'backbone-parent-id',
			settings: { _element_id: 'backbone-parent-element-id' } as never,
			elements: [
				createMockElementData( {
					id: 'backbone-child-id',
					settings: { _element_id: 'backbone-child-element-id' } as never,
				} ),
			],
		} );

		const sourceModel = {
			get: jest.fn( ( key ) => source[ key ] ),
			toJSON: jest.fn( () => source ),
		} as never;

		// Act.
		const cloned = cloneElementTree( sourceModel );

		// Assert.
		expect( sourceModel.toJSON ).toHaveBeenCalled();
		expect( cloned.id ).toBe( 'model-parent-id' );
		expect( cloned.settings?._element_id ).toBe( '' );
		expect( cloned.elements?.[ 0 ].id ).toBe( 'model-child-id' );
		expect( cloned.elements?.[ 0 ].settings?._element_id ).toBe( '' );
		expect( source.id ).toBe( 'backbone-parent-id' );
		expect( source.elements?.[ 0 ].id ).toBe( 'backbone-child-id' );
		expect( cloned ).not.toBe( sourceModel );
	} );
} );
