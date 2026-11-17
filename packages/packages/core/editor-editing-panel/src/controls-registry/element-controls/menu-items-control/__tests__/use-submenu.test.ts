import {
	createElements,
	getContainer,
	getWidgetsCache,
	removeElements,
	type V1Element,
} from '@elementor/editor-elements';
import { renderHook } from '@testing-library/react';

import { disableSubmenu, enableSubmenu, getParentEntryId, useSubmenu } from '../use-submenu';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateUseListenTo: jest.fn( ( _events, getSnapshot ) => getSnapshot() ),
} ) );

const child = ( id: string, elType: string ) => ( { id, model: { get: () => elType } } );

describe( 'use-submenu', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'e-menu-entry': {
				meta: {
					submenu_entitlement: { locked: false, promotion: { title: 'Mega Menu', content: 'c', ctaUrl: '' } },
				},
			},
		} as never );
	} );

	it( 'should report the submenu child and the entitlement of the entry', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( {
			children: [ child( 'item-1', 'e-menu-item' ), child( 'sub-1', 'e-menu-submenu' ) ],
		} as unknown as V1Element );

		// Act
		const { result } = renderHook( () => useSubmenu( 'entry-1' ) );

		// Assert
		expect( result.current.submenuId ).toBe( 'sub-1' );
		expect( result.current.locked ).toBe( false );
	} );

	it( 'should be locked when the entitlement is missing', () => {
		// Arrange
		jest.mocked( getWidgetsCache ).mockReturnValue( {} as never );
		jest.mocked( getContainer ).mockReturnValue( { children: [] } as unknown as V1Element );

		// Act
		const { result } = renderHook( () => useSubmenu( 'entry-1' ) );

		// Assert
		expect( result.current ).toEqual( { submenuId: null, locked: true, promotion: null } );
	} );

	it( 'should create the trigger and the submenu under the entry', () => {
		// Arrange
		const entry = { id: 'entry-1' } as unknown as V1Element;
		jest.mocked( getContainer ).mockReturnValue( entry );

		// Act
		enableSubmenu( 'entry-1' );

		// Assert
		const { elements } = jest.mocked( createElements ).mock.calls[ 0 ][ 0 ];
		expect( elements.map( ( { model } ) => model.elType ) ).toEqual( [
			'e-menu-submenu-trigger',
			'e-menu-submenu',
		] );
		expect( elements.every( ( { container } ) => container === entry ) ).toBe( true );
	} );

	it( 'should remove only the trigger and the submenu', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( {
			children: [
				child( 'item-1', 'e-menu-item' ),
				child( 'trig-1', 'e-menu-submenu-trigger' ),
				child( 'sub-1', 'e-menu-submenu' ),
			],
		} as unknown as V1Element );

		// Act
		disableSubmenu( 'entry-1' );

		// Assert
		expect( removeElements ).toHaveBeenCalledWith(
			expect.objectContaining( { elementIds: [ 'trig-1', 'sub-1' ] } )
		);
	} );

	it( 'should resolve the entry of a menu item only', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( {
			parent: { id: 'entry-1', model: { get: () => 'e-menu-entry' } },
		} as unknown as V1Element );

		// Act & Assert
		expect( getParentEntryId( 'item-1' ) ).toBe( 'entry-1' );

		jest.mocked( getContainer ).mockReturnValue( {
			parent: { id: 'x', model: { get: () => 'e-div-block' } },
		} as unknown as V1Element );

		expect( getParentEntryId( 'item-1' ) ).toBeNull();
	} );
} );
