/// <reference types="Cypress" />

describe( 'Test is section work as properly', () => {
	it( 'Should add section', () => {
		cy.addElementorPage().then( () => {
			cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
				cy.wrap( $iframe.contents().find( '.elementor-add-section-button' ) ).click();
				cy.wrap( $iframe.contents().find( 'li[data-structure="20"]' ) ).click();
				//cy.wrap( $iframe.contents().find( 'div.elementor-column' ) ).should( 'have.length', 2 );
			} );
			cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
				cy.wrap( $iframe.contents().find( '.elementor-section' ).last().find( '.elementor-column' ) ).should( 'have.length', 2 );
			} );

			cy.testHistory( { addedLength: 1, title: 'Section', action: 'Added' } );

			cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
				cy.wrap( $iframe.contents().find( '.elementor-section' ).last().find( '.elementor-editor-element-setting.elementor-editor-element-edit.ui-sortable-handle' ).first() )
					.click( { force: true } )
					.trigger( 'contextmenu' );
			} );
			cy.get( '.elementor-context-menu-list__group-addNew' ).click();

			cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
				cy.wrap( $iframe.contents().find( '.elementor-section' ).last().find( '.elementor-column' ) ).should( 'have.length', 3 );
			} );

			cy.testHistory( { addedLength: 1, title: 'Column', action: 'Added' } );

			cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
				cy.wrap( $iframe.contents().find( '.elementor-section' ).last().find( '.elementor-editor-element-setting.elementor-editor-element-edit.ui-sortable-handle' ).first() )
					.click( { force: true } )
					.trigger( 'contextmenu' );
			} );
			cy.get( '.elementor-context-menu-list__item-duplicate' ).click();

			cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
				cy.wrap( $iframe.contents().find( '.elementor-section' ).last().find( '.elementor-column' ) ).should( 'have.length', 4 );
			} );

			cy.testHistory( { addedLength: 1, title: 'Column', action: 'Added' } );
		} );
	} );
} );
