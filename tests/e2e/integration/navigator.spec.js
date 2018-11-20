/// <reference types="Cypress" />

describe( 'test the hide functionality of the navigator', () => {
	it( 'should hide the elementor in when hide in mobile is activated', () => {
		cy.addElementorPage();
		cy.addWidget( 'basic', 'heading' );
		cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
			cy.wrap( $iframe.contents().find( '.elementor-widget-heading' ) )
				.click( { force: true } )
				.trigger( 'contextmenu' );
		} );
		cy.get( '.elementor-context-menu-list__item-navigator' ).click();
		cy.get( '.elementor-tab-control-advanced' ).click();
		cy.get( '.elementor-control-_section_responsive' ).scrollIntoView().click();
		cy.get( '.elementor-control-hide_mobile .elementor-switch-label' ).click();

		cy.get( '.elementor-navigator__item.elementor-editing > .elementor-navigator__element__toggle' )
			.click( { force: true } );

		cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
			cy.wrap( $iframe.contents().find( '.elementor-widget-heading' ), { timeout: 5000 } )
				.should( 'not.be.visible' );
		} );
	} );
} );
