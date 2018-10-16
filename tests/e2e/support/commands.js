/// <reference types="Cypress" />
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add( 'iframe', { prevSubject: 'element' }, ( $iframe ) => {
    return new Cypress.Promise( ( resolve ) => {
        $iframe.on( 'load', () => {
            resolve( $iframe.contents().find( 'body' ) );
        } );
    } );
} );

Cypress.Commands.add( 'login', () => {
    cy.request( {
        url: '/wp-login.php', // assuming you've exposed a seeds route
        method: 'POST',
        form: true,
        headers: {
            wordpress_test_cookie: 'WP+Cookie+check',
        },
        body: {
            log: 'admin',
            pwd: 'password',
            'wp-submit': 'LogIn',
            redirect_to: '/wp-admin/',
            testcookie: 1,
        },
    } );
} );

Cypress.Commands.add( 'addElementorPage', () => {
    cy.visit( '/wp-admin/post-new.php?post_type=page' );
    cy.get( '[id=content-html]' ).click();
    cy.get( '[id=content]' ).type( 'Elementor' );
    cy.get( '[id=elementor-switch-mode-button]' ).click();
} );
