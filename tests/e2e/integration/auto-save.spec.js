/// <reference types="Cypress" />

describe( 'Test If The Editor Load', () => {
    it( 'Sould Load', () => {
        cy.visit( '/wp-admin' );

        cy.addElementorPage();
        cy.get( '[id=elementor-loading]' ).should( 'be.hidden' );
    } );
} );
