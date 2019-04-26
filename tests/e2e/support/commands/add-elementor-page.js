/// <reference types="Cypress" />

function addElementorPage() {
	cy.visit( '/wp-admin/post-new.php?post_type=page' );
	cy.get( '[id=elementor-switch-mode-button]' ).click();
	cy.get( '[id=elementor-loading]' ).should( 'be.hidden' );
	cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
		cy.wrap( $iframe.contents().find( '.elementor-add-section-button' ) ).click();
		cy.wrap( $iframe.contents().find( '[data-structure="10"]' ) ).click();
	} );
	Cypress.env( 'history', 2 );
	cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
		return $iframe.attr( 'src' ).split( /\?(p.*?)\&/ )[ 1 ].split( /.*=/ )[ 1 ];
	} );
}

Cypress.Commands.add( 'addElementorPage', addElementorPage );
