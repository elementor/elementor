/// <reference types="Cypress" />

const templateName = 'presetPage' + Date.now();

describe( 'Tests if maintenance mode works properly', () => {
	before( () => {
		cy.login( 'admin' );
		cy.addTemplate( {
			templateType: 'page',
			presetSearch: 'COMING SOON 5',
			name: templateName,
		} ).then( ( templateId ) => {
			Cypress.env( 'maintenanceModeTemplateId', templateId );
		} );
	} );

	it( 'should show maintenance mode in the main page', () => {
		cy.visit( 'wp-admin/admin.php?page=elementor-tools#tab-maintenance_mode' );
		cy.get( 'select[name="elementor_maintenance_mode_mode"]' ).select( 'Coming Soon' );
		cy.get( 'select[name="elementor_maintenance_mode_template_id"]' ).select( templateName );
		cy.get( '#submit' ).click();
		cy.clearCookies();
		cy.setCookie( 'wordpress_test_cookie', 'WP+Cookie+check' );
		cy.visit( '/' );
		cy.get( '.elementor-' + Cypress.env( 'maintenanceModeTemplateId' ) );
		cy.request( { url: '/' } ).then( ( res ) => {
			expect( res.status ).to.eq( 200 );
		} );
	} );

	it( 'should return 503', () => {
		cy.visit( 'wp-admin/admin.php?page=elementor-tools#tab-maintenance_mode' );
		cy.get( 'select[name="elementor_maintenance_mode_mode"]' ).select( 'Maintenance' );
		cy.get( 'select[name="elementor_maintenance_mode_template_id"]' ).select( templateName );
		cy.get( '#submit' ).click();
		cy.clearCookies();
		cy.setCookie( 'wordpress_test_cookie', 'WP+Cookie+check' );
		cy.visit( '/', { failOnStatusCode: false } );
		cy.get( '.elementor-' + Cypress.env( 'maintenanceModeTemplateId' ) );
		cy.request( { url: '/', failOnStatusCode: false } ).then( ( res ) => {
			expect( res.status ).to.eq( 503 );
		} );
	} );
} );
