/// <reference types="Cypress" />

describe( 'Test If The Frontend handlers works', () => {
    it( 'Should open the `Toggle` content', () => {
        cy.addElementorPage().then( ( pageId ) => {
            cy.addWidget( 'general', 'toggle' );

            cy.wait( 100 );

            cy.get( '#elementor-panel-saver-button-publish' ).click();

            cy.wait( 100 );

            cy.get( '#elementor-toast' ).should( 'be.visible' );

            cy.visit( '/?p=' + pageId ).then( () => {
                cy.get( '.elementor-tab-title:first' ).click();
                cy.get( '.elementor-tab-content:first' ).should( 'be.visible' );
            } );
         } );
    } );
} );
