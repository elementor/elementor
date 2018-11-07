/// <reference types="Cypress" />

/**
 *
 * @param {object} options
 * @param {number} options.length the length of history.
 * @param {string} options.title current item title.
 * @param {string} options.action current item action.
 * @param {string} [options.caseSensitive=true] if the steast sould consider case checks or "-" and "_"
 */
function testHistory( options ) {
    if ( ! options.hasOwnProperty( 'caseSensitive' ) ) {
        options.caseSensitive = true;
    }
    cy.get( '#elementor-panel-footer-history' ).click();
    cy.get( '.elementor-history-item' ).should( 'have.length', options.length );
    cy.get(
        '.elementor-history-item-current > .elementor-history-item > .elementor-history-item__details > .elementor-history-item__title'
    )
        .invoke( 'text' )
        .then( ( text ) => {
            if ( ! options.caseSensitive ) {
                options.title = options.title.replace( /[-_]/g, ' ' );
                expect( text.toLocaleLowerCase() ).to.contain( options.title.toLocaleLowerCase() );
            } else {
                expect( text ).to.contain( options.title );
            }
        } );
    cy.get(
        '.elementor-history-item-current > .elementor-history-item > .elementor-history-item__details > .elementor-history-item__action'
    )
        .invoke( 'text' )
        .then( ( text ) => {
            if ( ! options.caseSensitive ) {
                options.action = options.action.replace( /[-_]/g, ' ' );
                expect( text.toLocaleLowerCase() ).to.contain( options.action.toLocaleLowerCase() );
            } else {
                expect( text ).to.contain( options.action );
            }
        } );
}

Cypress.Commands.add( 'testHistory', testHistory );
