/// <reference types="Cypress" />

function addElementorPage() {
	cy.visit( '/wp-admin/post-new.php?post_type=page' );
	cy.get( '[id=content-html]' ).click();
	cy.get( '[id=content]' ).type( 'Elementor' );
	cy.get( '[id=elementor-switch-mode-button]' ).click();
	cy.get( '[id=elementor-loading]' ).should( 'be.hidden' );
    Cypress.env( 'history', 1 );
	cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
		return $iframe.attr( 'src' ).split( /\?(p.*?)\&/ )[ 1 ].split( /.*=/ )[ 1 ];
	} );
}

Cypress.Commands.add( 'addElementorPage', addElementorPage );
