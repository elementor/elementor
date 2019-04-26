/// <reference types="Cypress" />

function disableElementorPopup() {
	cy.window()
		.then( ( win ) => {
			win.elementor.channels.editor.reply( 'status', false );
		} );
}

Cypress.Commands.add( 'disableElementorPopup', disableElementorPopup );
