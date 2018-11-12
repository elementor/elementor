/// <reference types="Cypress" />
beforeEach( function() {
	cy.login( 'admin' );
} );

afterEach( function() {
	cy.window()
		.then( ( win ) => {
			if ( win.elementor ) {
				win.elementor.channels.editor.reply( 'status', false );
			}
		} );
} );
