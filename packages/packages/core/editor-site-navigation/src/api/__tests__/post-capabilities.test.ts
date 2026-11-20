import { canAccessSiteContentPanel, getAccessiblePanelPostTypes } from '../post';

describe( 'post panel capabilities', () => {
	it( 'returns both types when user can edit pages and posts', () => {
		expect(
			getAccessiblePanelPostTypes( {
				edit_pages: true,
				edit_posts: true,
			} )
		).toEqual( [ 'page', 'post' ] );
		expect( canAccessSiteContentPanel( { edit_pages: true, edit_posts: true } ) ).toBe( true );
	} );

	it( 'returns only pages when user can edit pages', () => {
		expect( getAccessiblePanelPostTypes( { edit_pages: true } ) ).toEqual( [ 'page' ] );
		expect( canAccessSiteContentPanel( { edit_pages: true } ) ).toBe( true );
	} );

	it( 'returns only posts when user can edit posts', () => {
		expect( getAccessiblePanelPostTypes( { edit_posts: true } ) ).toEqual( [ 'post' ] );
		expect( canAccessSiteContentPanel( { edit_posts: true } ) ).toBe( true );
	} );

	it( 'returns empty when user cannot edit pages or posts', () => {
		expect( getAccessiblePanelPostTypes( {} ) ).toEqual( [] );
		expect( canAccessSiteContentPanel( {} ) ).toBe( false );
	} );
} );
