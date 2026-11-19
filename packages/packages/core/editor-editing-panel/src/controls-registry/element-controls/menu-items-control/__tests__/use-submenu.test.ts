import { getContainer, getWidgetsCache, type V1Element } from '@elementor/editor-elements';

import { getParentEntryId, getSubmenuPromotion } from '../use-submenu';

jest.mock( '@elementor/editor-elements' );

const promotion = { title: 'Mega Menu', content: 'content', ctaUrl: 'https://go.example' };

describe( 'use-submenu', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return the promotion when the entitlement is locked', () => {
		// Arrange
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'e-menu-entry': { meta: { submenu_entitlement: { locked: true, promotion } } },
		} as never );

		// Act & Assert
		expect( getSubmenuPromotion() ).toEqual( promotion );
	} );

	it( 'should return nothing when the entitlement is unlocked', () => {
		// Arrange
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'e-menu-entry': { meta: { submenu_entitlement: { locked: false, promotion } } },
		} as never );

		// Act & Assert
		expect( getSubmenuPromotion() ).toBeNull();
	} );

	it( 'should return nothing when the entitlement meta is missing', () => {
		// Arrange
		jest.mocked( getWidgetsCache ).mockReturnValue( {} as never );

		// Act & Assert
		expect( getSubmenuPromotion() ).toBeNull();
	} );

	it( 'should resolve the parent entry of a menu item', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( {
			parent: { id: 'entry-1', model: { get: () => 'e-menu-entry' } },
		} as unknown as V1Element );

		// Act & Assert
		expect( getParentEntryId( 'item-1' ) ).toBe( 'entry-1' );
	} );

	it( 'should not resolve a parent that is not a menu entry', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( {
			parent: { id: 'x', model: { get: () => 'e-div-block' } },
		} as unknown as V1Element );

		// Act & Assert
		expect( getParentEntryId( 'item-1' ) ).toBeNull();
	} );
} );
