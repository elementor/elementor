/// <reference types="Cypress" />

Cypress.Commands.add( 'login', ( user ) => {
	cy.request( {
		url: '/wp-login.php', // assuming you've exposed a seeds route
		method: 'POST',
		form: true,
		headers: {
			wordpress_test_cookie: 'WP+Cookie+check',
		},
		body: {
			log: user,
			pwd: 'password',
			'wp-submit': 'LogIn',
			redirect_to: '/wp-admin/',
			testcookie: 1,
		},
	} );
} );
