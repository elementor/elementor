/// <reference types="Cypress" />

describe( 'Tests if maintenance mode works properly', () => {
	it( 'should show maintenance mode in the main page', () => {
		const templateName = 'presetPage' + Date.now();
		cy.addTemplate( {
			templateType: 'page',
			presetSearch: 'COMING SOON 5',
			name: templateName,
		} ).then( ( templateId ) => {
			cy.visit( 'wp-admin/admin.php?page=elementor-tools#tab-maintenance_mode' );
			cy.get( 'select[name="elementor_maintenance_mode_template_id"]' ).select( templateName );
			cy.get( '#submit' ).click();
			cy.clearCookies();
			cy.setCookie( 'wordpress_test_cookie', 'WP+Cookie+check' );
			cy.visit( '/' );
			cy.get( 'elementor-' + templateId );
		} );
	} );
} );
