/// <reference types="Cypress" />

describe( 'Test If Try Safe Mode is shown', () => {
	it( 'Should show the Safe Mode notice', () => {
		cy.addElementorPage().then( ( pageId ) => {
			// With `ELEMENTOR_TESTS=1` elementor should not run.
			cy.visit( '/wp-admin/post.php?post=' + pageId + '&action=elementor&ELEMENTOR_TESTS=1' );

			// On loading the Try Safe Mode should be hidden.
			cy.get( '#elementor-try-safe-mode' ).should( 'not.be.visible' );

			cy.wait( 10001 );

			// After 10 sec that the editor is not loaded the Try Safe Mode should appear.
			cy.get( '#elementor-try-safe-mode' ).should( 'be.visible' );

			// Click on Try Safe Mode.
			cy.get( '.elementor-safe-mode-button' ).click();

			// After reload the Safe Mode message should appear But the Try Safe Mode should be removed..
			cy.get( '#elementor-safe-mode-message' ).should( 'be.visible' );
			cy.get( '#elementor-try-safe-mode' ).should( 'not.exist' );

			// Exit Safe Mode.
			cy.get( '.elementor-disable-safe-mode' ).click();

			// The Safe Mode message should not exist.
			cy.get( '#elementor-safe-mode-message' ).should( 'not.exist' );
		} );
	} );
} );
