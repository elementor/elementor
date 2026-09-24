import { createMockElementData } from 'test-utils';

import { cloneElementTree } from '../clone-element-tree';

describe( 'cloneElementTree', () => {
	beforeEach( () => {
		( window as typeof window & {
			elementorCommon?: { helpers?: { getUniqueId?: jest.Mock } };
		} ).elementorCommon = {
			helpers: {
				getUniqueId: jest
					.fn()
					.mockReturnValueOnce( 'cloned-parent-id' )
					.mockReturnValueOnce( 'cloned-child-id' ),
			},
		};
	} );

	afterEach( () => {
		delete ( window as typeof window & { elementorCommon?: unknown } ).elementorCommon;
	} );

	it( 'regenerates ids recursively and clears custom element ids', () => {
		// Arrange.
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
} );
