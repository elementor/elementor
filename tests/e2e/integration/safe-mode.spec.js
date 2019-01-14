/// <reference types="Cypress" />

describe( 'Test If Try Safe Mode is shown', () => {
	it( 'Should show the Safe Mode notice', () => {
		cy.addElementorPage().then( ( pageId ) => {
			cy.visit( '/wp-admin/post.php?post=' + pageId + '&action=elementor&ELEMENTOR_TESTS=1' );

			cy.get( '.elementor-safe-mode-toast' ).should( 'not.be.visible' );

			cy.wait( 10001 );

			cy.get( '.elementor-safe-mode-toast' ).should( 'be.visible' );
		} );
	} );
} );
