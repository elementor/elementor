/// <reference types="Cypress" />

/**
 * add a new elementor tempalte
 *
 * @param {Object} options
 * @param {string} options.templateType the post type ( Page | Section )
 * @param {string} [options.presetSearch] what to search in Elementor template library
 * @param {number} [options.presetNumber] the place of the template in the library
 * @param {string} [options.name] the place of the template in the library
 */
function addTemplate( options ) {
	cy.visit( '/wp-admin/edit.php?post_type=elementor_library' );
	cy.get( '.page-title-action' ).eq( 0 ).click();
	cy.get( '#elementor-new-template__form__template-type' ).select( options.templateType );
	if ( options.name ) {
		cy.get( '#elementor-new-template__form__post-title' ).type( options.name );
	}
	cy.get( '#elementor-new-template__form__submit' ).click();
	if ( options.presetNumber || options.presetSearch ) {
		cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
			cy.wrap( $iframe.contents().find( '.elementor-add-template-button' ) ).click();
		} );
		if ( options.presetSearch ) {
			cy.get( '#elementor-template-library-filter-text' ).type( options.presetSearch );
		}
		if ( ! options.presetNumber ) {
			options.presetNumber = 1;
		}
		cy.get( `:nth-child(${ options.presetNumber }) > .elementor-template-library-template-body > .elementor-template-library-template-preview`, { timeout: 30000 } )
			.click();
		cy.get( '.elementor-template-library-template-action' ).click();
	}
	cy.get( '.dialog-lightbox-widget-content', { timeout: 30000 } ).should( 'not.be.visible' );
	cy.get( '#elementor-panel-saver-button-publish' ).click();
	cy.get( '.elementor-saver-disabled' ).should( 'exist' );
	cy.get( '#elementor-preview-iframe' ).then( ( $iframe ) => {
		return $iframe.attr( 'src' ).split( /\?(p.*?)\&/ )[ 1 ].split( /.*=/ )[ 1 ];
	} );
}

Cypress.Commands.add( 'addTemplate', addTemplate );
