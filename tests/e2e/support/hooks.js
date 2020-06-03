/// <reference types="Cypress" />
beforeEach( function() {
	cy.login( 'admin' );
} );

afterEach( function() {
	/*
	 * This exist because electron dose not show Prompt, alers and confirms.
	 * Cypress runs on electron and elementor alert the "user" from switching pages.
	 * This make cypress stack and unable to continue.
	 * So because of this, this event disable the confirm.
	 */
	cy.window()
		.then( ( win ) => {
			if ( win.elementor ) {
				win.elementor.channels.editor.reply( 'status', false );
			}
		} );
} );
