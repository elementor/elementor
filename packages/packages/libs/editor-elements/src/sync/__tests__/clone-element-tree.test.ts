import { createMockElementData } from 'test-utils';

import { cloneElementTree } from '../clone-element-tree';
import { type BackboneModel, type V1ElementModelProps } from '../types';

type TestElementData = {
	id: string;
	elType?: string;
	widgetType?: string;
	settings?: {
		_element_id?: string;
	};
	elements?: TestElementData[];
};

function getUniqueIdMock() {
	return (
		window as typeof window & {
			elementorCommon?: { helpers?: { getUniqueId?: jest.Mock } };
		}
	 ).elementorCommon?.helpers?.getUniqueId;
}

describe( 'cloneElementTree', () => {
	beforeEach( () => {
		(
			window as typeof window & {
				elementorCommon?: { helpers?: { getUniqueId?: jest.Mock } };
			}
		 ).elementorCommon = {
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
		getUniqueIdMock()?.mockReturnValueOnce( 'cloned-parent-id' ).mockReturnValueOnce( 'cloned-child-id' );

		const source = createMockElementData( {
			id: 'original-parent-id',
			settings: { _element_id: 'original-parent-element-id' } as never,
			elements: [
				createMockElementData( {
					id: 'original-child-id',
					settings: { _element_id: 'original-child-element-id' } as never,
				} ),
			],
		} ) as unknown as TestElementData;

		// Act.
		const cloned = cloneElementTree( source as Partial< V1ElementModelProps > ) as unknown as TestElementData;

		// Assert.
		expect( cloned.id ).toBe( 'cloned-parent-id' );
		expect( cloned.settings?._element_id ).toBe( '' );
		expect( cloned.elements?.[ 0 ]?.id ).toBe( 'cloned-child-id' );
		expect( cloned.elements?.[ 0 ]?.settings?._element_id ).toBe( '' );
		expect( source.id as string ).toBe( 'original-parent-id' );
		expect( source.elements?.[ 0 ]?.id as string ).toBe( 'original-child-id' );
	} );

	it( 'regenerates ids recursively for Backbone model input', () => {
		// Arrange.
		getUniqueIdMock()?.mockReturnValueOnce( 'model-parent-id' ).mockReturnValueOnce( 'model-child-id' );

		const source = createMockElementData( {
			id: 'backbone-parent-id',
			settings: { _element_id: 'backbone-parent-element-id' } as never,
			elements: [
				createMockElementData( {
					id: 'backbone-child-id',
					settings: { _element_id: 'backbone-child-element-id' } as never,
				} ),
			],
		} ) as unknown as TestElementData;

		const toJSON = jest.fn( () => source );

		const sourceModel = {
			get: jest.fn( ( key: string ) => source[ key as keyof TestElementData ] ),
			set: jest.fn(),
			toJSON,
		} as BackboneModel;

		// Act.
		const cloned = cloneElementTree( sourceModel ) as unknown as TestElementData;

		// Assert.
		expect( toJSON ).toHaveBeenCalled();
		expect( cloned.id ).toBe( 'model-parent-id' );
		expect( cloned.settings?._element_id ).toBe( '' );
		expect( cloned.elements?.[ 0 ].id ).toBe( 'model-child-id' );
		expect( cloned.elements?.[ 0 ].settings?._element_id ).toBe( '' );
		expect( source.id ).toBe( 'backbone-parent-id' );
		expect( source.elements?.[ 0 ].id ).toBe( 'backbone-child-id' );
		expect( cloned ).not.toBe( sourceModel );
	} );
} );
