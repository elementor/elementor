/// <reference types="Cypress" />

function removeWidget( selector ) {
	cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
		cy.wrap( $iframe.contents().find( selector ), { timeout: 5000 } )
			.click( { force: true } )
			.trigger( 'contextmenu' );
	} );
	cy.get( '.elementor-context-menu-list__group-delete' ).click();
}

Cypress.Commands.add( 'removeWidget', removeWidget );
