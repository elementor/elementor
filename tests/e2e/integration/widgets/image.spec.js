/// <reference types="Cypress" />

describe( 'Tests the funcnaliti of the widget image', () => {
	it( 'Should not dispaly empty image', () => {
		cy.addElementorPage().then( ( pageId ) => {
			cy.addWidget( 'basic', 'image' ).then( ( colomeView ) => {
				const columnId = colomeView.model.get( 'id' ),
					widgetId = colomeView.model.get( 'elements' ).first().get( 'id' );
				cy.get( '.elementor-control-media__replace' ).click( { force: true } );

				cy.get( '#elementor-panel-saver-button-publish' ).click();
				cy.wait( 100 );
				cy.get( '#elementor-panel-saver-button-publish' ).click();
				cy.get( '.elementor-button.elementor-button-success.elementor-disabled' ).should( 'exist' );

				cy.visit( '/?p=' + pageId );
				cy.get( '[data-id=' + widgetId + ']' ).should( 'not.exist' );
				cy.get( '[data-id=' + columnId + ']' ).should( 'exist' );
			} );
		} );
	} );
} );

