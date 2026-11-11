import { createElements, getContainer, removeElements, type V1Element } from '@elementor/editor-elements';
import { renderHook } from '@testing-library/react';

import { useActions } from '../use-actions';

jest.mock( '@elementor/editor-elements' );

const payload = ( ...ids: string[] ) => ids.map( ( id, index ) => ( { item: { id }, index } ) );

describe( 'menu-items-control actions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	const mockEntries = ( count: number ) => {
		jest.mocked( getContainer ).mockReturnValue( {
			children: Array.from( { length: count }, ( _, i ) => ( { id: `entry-${ i }` } ) ),
		} as unknown as V1Element );
	};

	it( 'should not remove the last remaining entry', () => {
		// Arrange
		mockEntries( 1 );
		const { result } = renderHook( () => useActions() );

		// Act
		result.current.removeItem( { menuItemsId: 'items', items: payload( 'entry-0' ) } );

		// Assert
		expect( removeElements ).not.toHaveBeenCalled();
	} );

	it( 'should remove an entry when more than one exists', () => {
		// Arrange
		mockEntries( 2 );
		const { result } = renderHook( () => useActions() );

		// Act
		result.current.removeItem( { menuItemsId: 'items', items: payload( 'entry-1' ) } );

		// Assert
		expect( removeElements ).toHaveBeenCalledWith( expect.objectContaining( { elementIds: [ 'entry-1' ] } ) );
	} );

	it( 'should keep at least one entry when removing all of them', () => {
		// Arrange
		mockEntries( 2 );
		const { result } = renderHook( () => useActions() );

		// Act
		result.current.removeItem( { menuItemsId: 'items', items: payload( 'entry-0', 'entry-1' ) } );

		// Assert
		expect( removeElements ).toHaveBeenCalledWith( expect.objectContaining( { elementIds: [ 'entry-0' ] } ) );
	} );

	it( 'should name new entries "Menu item N" with a number not used by existing entries', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( {
			children: [ 'Home', 'Menu item 3', 'Menu item 4' ].map( ( title ) => ( {
				model: { get: () => ( { title } ) },
			} ) ),
		} as unknown as V1Element );
		const { result } = renderHook( () => useActions() );

		// Act
		result.current.addItem( { menuItemsId: 'items', items: payload( '' ) } );

		// Assert
		const elements = jest.mocked( createElements ).mock.calls[ 0 ]?.[ 0 ].elements ?? [];

		expect( elements[ 0 ]?.model.editor_settings ).toEqual( { title: 'Menu item 5' } );
	} );
} );
