import { getContainer, getElementSettings, getElementType, type V1Element } from '@elementor/editor-elements';
import { __privateUseListenTo as useListenTo } from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import { useEntryItem } from '../use-entry-item';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateUseListenTo: jest.fn( ( _events, getSnapshot ) => getSnapshot() ),
} ) );

const child = ( id: string, elType: string ) => ( { id, model: { get: () => elType } } );

describe( 'useEntryItem', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( getElementType ).mockReturnValue( { propsSchema: { link: {}, classes: {} } } as never );
		jest.mocked( getElementSettings ).mockReturnValue( { link: null, classes: null } );
	} );

	it( 'should return the e-menu-item child of the entry with its settings', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( {
			children: [ child( 'other', 'e-paragraph' ), child( 'item-1', 'e-menu-item' ) ],
		} as unknown as V1Element );

		// Act
		const { result } = renderHook( () => useEntryItem( 'entry-1' ) );

		// Assert
		expect( result.current.itemId ).toBe( 'item-1' );
		expect( getElementSettings ).toHaveBeenCalledWith( 'item-1', [ 'link', 'classes' ] );
	} );

	it( 'should return no item when the entry has no e-menu-item child', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( { children: [] } as unknown as V1Element );

		// Act
		const { result } = renderHook( () => useEntryItem( 'entry-1' ) );

		// Assert
		expect( result.current ).toEqual( { itemId: null, settings: {} } );
	} );

	it( 'should refresh on settings commands', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( { children: [] } as unknown as V1Element );

		// Act
		renderHook( () => useEntryItem( 'entry-1' ) );

		// Assert
		expect( useListenTo ).toHaveBeenCalledWith( [ expect.anything(), expect.anything() ], expect.any( Function ), [
			'entry-1',
		] );
	} );
} );
