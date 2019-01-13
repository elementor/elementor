/// <reference types="Cypress" />

const canvasTemplate = 'Canvas-Template' + Date.now();

describe( 'Tests if Canvas Template works', () => {
	it( 'should show elementor-template-canvas without editing in elementor', () => {
		cy.visit( '/wp-admin/post-new.php' );
		cy.wait( 200 );
		cy.get( '.components-popover__content > .components-icon-button' ).click();
		cy.get( '#post-title-0' ).click().type( canvasTemplate );
		cy.get( ':nth-child(7) > .components-panel__body-title > .components-button' )
			.should( 'be.visible' ).click();
		cy.get( 'select' ).contains( 'Elementor Canvas' ).parent( 'select' ).select( 'Elementor Canvas' );
		cy.get( '.editor-default-block-appender__content' ).click();
		cy.get( '[aria-label="Empty block; start writing or type forward slash to choose a block"]' ).click()
			.type( 'Text' );
		cy.get( '.editor-post-publish-panel__toggle' ).click();
		cy.get( '.editor-post-publish-panel__header-publish-button > .components-button' ).click();
		cy.get( '.editor-post-publish-panel__header-published' ).should( 'exist' );
		cy.get( '.post-publish-panel__postpublish-buttons > a.components-button' ).click();
		cy.get( '.elementor-template-canvas' ).should( 'exist' );
	} );

	it( 'should show elementor-template-canvas with editing in elementor', () => {
		cy.visit( '/wp-admin/edit.php' );
		cy.get( 'a[class="row-title"]' ).contains( canvasTemplate ).click();
		cy.get( '#elementor-switch-mode-button' ).click();
		cy.addWidget( 'basic', 'heading' );
		cy.get( '#elementor-panel-saver-button-save-options' ).click();
		cy.get( '#elementor-panel-footer-sub-menu-item-save-draft > .elementor-title' ).click();

		cy.disableElementorPopup();

		cy.visit( '/wp-admin/edit.php' );
		cy.get( 'a[class="row-title"]' ).contains( canvasTemplate ).click();
		cy.wait( 200 );
		cy.get( '#elementor-switch-mode-button' ).click();
		cy.get( '.editor-block-list__block' ).click();
		cy.get( '#mce_0' ).type( 'some-test' );
		cy.get( '.editor-post-publish-button' ).should( 'have.attr', 'aria-disabled', 'true' );
		cy.get( '.editor-post-publish-button' ).should( 'have.attr', 'aria-disabled', 'false' );

		cy.get( '.editor-post-preview' ).invoke( 'attr', 'href' ).then( ( url ) => {
			cy.visit( url );
		} );
		cy.get( '.elementor-template-canvas' ).should( 'exist' );
	} );
} );
