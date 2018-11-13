/// <reference types="Cypress" />
before( 'Test if Widgets work as exprected', () => {
	cy.login( 'admin' );
	cy.addElementorPage();
	cy.getCookies().then( ( cookies ) => {
		Cypress.env( 'cookies', cookies );
	} );
} );
let length = 1;

describe( 'Test if Widgets work as exprected', () => {
	[
		{ category: 'basic', widget: 'heading' },
		{ category: 'basic', widget: 'image' },
		{ category: 'basic', widget: 'video', delay: 1000 },
		{ category: 'basic', widget: 'button' },
		{ category: 'basic', widget: 'divider' },
		{ category: 'basic', widget: 'spacer' },
		{ category: 'basic', widget: 'google_maps', delay: 2000 },
		{ category: 'basic', widget: 'icon' },
		{ category: 'general', widget: 'image-box' },
		{ category: 'general', widget: 'icon-box' },
		{ category: 'general', widget: 'image-gallery', delay: 1000 },
		{ category: 'general', widget: 'image-carousel', delay: 1000 },
		{ category: 'general', widget: 'icon-list' },
		{ category: 'general', widget: 'counter' },
		{ category: 'general', widget: 'progress' },
		{ category: 'general', widget: 'testimonial' },
		{ category: 'general', widget: 'social-icons' },
		{ category: 'general', widget: 'alert' },
		{ category: 'general', widget: 'audio', delay: 1000 },
		{ category: 'general', widget: 'shortcode', delay: 1000 },
		{ category: 'general', widget: 'html' },
		{ category: 'general', widget: 'menu-anchor' },
		{ category: 'general', widget: 'sidebar', delay: 1000 },
	].forEach( ( widget ) => {
		it( 'Should show ' + widget.widget, () => {
			Cypress.env( 'cookies' ).forEach( ( cookie ) => {
				cy.setCookie( cookie.name, cookie.value );
			} );

			cy.get( '#elementor-panel-header-add-button' ).click();

			cy.addWidget( widget.category, widget.widget ).then( ( colomeView ) => {
				assert.equal( colomeView.model.get( 'elements' ).first().get( 'widgetType' ), widget.widget );
			} );

			cy.testHistory( {
				length: ++length,
				title: 'audio' === widget.widget ? 'soundcloud' : widget.widget,
				action: 'added',
				caseSensitive: false,
			} );

			if ( widget.delay ) {
				cy.wait( widget.delay );
			}

			cy.removeWidget( '[data-element_type="' + widget.widget + '.default"]' );

			cy.testHistory( {
				length: ++length,
				title: 'audio' === widget.widget ? 'soundcloud' : widget.widget,
				action: 'removed',
				caseSensitive: false,
			} );
		} );
	} );
} );
