/// <reference types="Cypress" />

describe( 'Test If The Editor Load', () => {
    it( 'Should Load', () => {
        cy.visit( '/wp-admin/' );

        cy.addElementorPage();
    } );
} );
