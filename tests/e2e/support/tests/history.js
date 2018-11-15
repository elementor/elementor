/// <reference types="Cypress" />

function assertTest( given, expected, caseSensitive ) {
	if ( ! caseSensitive ) {
		expected = expected.replace( /[-_]/g, ' ' );
		given = given.replace( /[-_]/g, ' ' );
		expected = expected.toLocaleLowerCase();
		given = given.toLocaleLowerCase();
	}
	expect( given ).to.contain( expected );
}

/**
 *
 * @param {object} options
 * @param {number} options.addedLength the added length to history.
 * @param {string} options.title current item title.
 * @param {string} options.action current item action.
 * @param {string} [options.caseSensitive=true] if the steast sould consider case checks or "-" and "_"
 */
function testHistory( options ) {
	if ( ! options.hasOwnProperty( 'caseSensitive' ) ) {
		options.caseSensitive = true;
	}
	cy.get( '#elementor-panel-footer-history' ).click();
	cy.get( '.elementor-history-item' ).should( 'have.length', Cypress.env( 'history' ) + options.addedLength );
    cy.get( '.elementor-history-item' ).its( 'length' ).then( ( length ) => {
		Cypress.env( 'history', length );
	} );
	cy.get( '.elementor-history-item-current > .elementor-history-item > .elementor-history-item__details > .elementor-history-item__title' )
		.invoke( 'text' )
		.then( ( text ) => {
			assertTest( text, options.title, options.caseSensitive );
		} );
	cy.get( '.elementor-history-item-current > .elementor-history-item > .elementor-history-item__details > .elementor-history-item__action' )
		.invoke( 'text' )
		.then( ( text ) => {
			assertTest( text, options.action, options.caseSensitive );
		} );
}

Cypress.Commands.add( 'testHistory', testHistory );
