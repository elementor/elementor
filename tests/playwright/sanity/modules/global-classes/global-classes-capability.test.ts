import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

// Extend Window interface to include Elementor globals
declare global {
	interface Window {
		elementor?: {
			config?: {
				user?: {
					capabilities?: string[];
				};
			};
		};
		ElementorConfig?: {
			nonce?: string;
		};
	}
}

test.describe( 'Global Classes Capability Tests', () => {
	const GLOBAL_CLASSES_CAPABILITY = 'elementor_global_classes_update_class';
	let testUser: { id: string; username: string; password: string };

	test.beforeAll( async ( { browser, apiRequests } ) => {
		// Create a user without global classes editing capability (editor role)
		const context = await browser.newContext();
		const page = await context.newPage();

		testUser = await apiRequests.createNewUser( page.context().request, {
			username: 'editorUser',
			password: 'password',
			email: 'editor@test.com',
			roles: [ 'editor' ],
		} );

		await context.close();
	} );

	test.afterAll( async ( { browser, apiRequests } ) => {
		// Clean up the test user
		if ( testUser?.id ) {
			const context = await browser.newContext();
			const page = await context.newPage();

			try {
				await apiRequests.deleteUser( page.context().request, testUser.id );
			} catch ( error ) {
				// Silently handle cleanup errors - test cleanup should not fail the test
			}

			await context.close();
		}
	} );

	test( 'User without global classes capability can publish content without errors', async ( { browser, apiRequests }, testInfo ) => {
		await test.step( 'Login as user without global classes capability', async () => {
			const context = await browser.newContext( { storageState: undefined } );
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

			await wpAdmin.customLogin( testUser.username, testUser.password );

			// Enable atomic elements experiment for this user session
			await wpAdmin.setExperiments( {
				e_atomic_elements: 'active',
				e_classes: 'active', // Enable global classes experiment
			} );

			const editor = await wpAdmin.openNewPage( false, false );

			// Verify user doesn't have global classes capability
			const userCapabilities = await page.evaluate( () => {
				return window.elementor?.config?.user?.capabilities || [];
			} );

			expect( userCapabilities ).not.toContain( GLOBAL_CLASSES_CAPABILITY );

			await test.step( 'Add atomic heading widget and publish without errors', async () => {
				// Add an atomic heading widget (e-heading is the correct widget type)
				await editor.addWidget( { widgetType: 'e-heading' } );

				// Set some content for the heading by typing in the widget
				const headingWidget = editor.getPreviewFrame().locator( '[data-widget_type="e-heading.default"]' );
				await headingWidget.click();
				await headingWidget.type( 'Test Heading Content' );

				// Verify the widget was added successfully
				await expect( headingWidget ).toBeVisible();
				await expect( headingWidget ).toContainText( 'Test Heading Content' );

				// Attempt to publish the page
				let publishError = false;
				const consoleErrors: string[] = [];

				// Listen for console errors that might indicate global classes save failures
				page.on( 'console', ( msg ) => {
					if ( 'error' === msg.type() ) {
						const errorText = msg.text();
						consoleErrors.push( errorText );

						// Check for global classes related errors
						if ( errorText.includes( 'global' ) && errorText.includes( 'class' ) ) {
							publishError = true;
						}
					}
				} );

				// Listen for network errors that might indicate API failures
				page.on( 'response', ( response ) => {
					if ( ! response.ok() && response.url().includes( 'global-classes' ) ) {
						publishError = true;
					}
				} );

				// Publish the page
				await editor.publishPage();

				// Wait a moment for any async operations to complete
				await page.waitForTimeout( 2000 );

				// Verify no global classes related errors occurred
				expect( publishError, 'Global classes save should not cause errors for users without capability' ).toBe( false );

				// Check that no global classes related console errors occurred
				const globalClassesErrors = consoleErrors.filter( ( error ) =>
					error.toLowerCase().includes( 'global' ) && error.toLowerCase().includes( 'class' ),
				);
				expect( globalClassesErrors, 'No global classes related console errors should occur' ).toHaveLength( 0 );

				// Verify the page was published successfully by checking for success indicators
				const publishSuccessIndicator = page.locator( '.elementor-button-success, [data-elementor-action="publish"][aria-label*="published"], .elementor-panel-footer-publish .elementor-button-success' );
				await expect( publishSuccessIndicator ).toBeVisible( { timeout: 10000 } );
			} );

			// Reset experiments
			await wpAdmin.resetExperiments();
			await context.close();
		} );
	} );

	test( 'Publishing content with global classes changes requires proper capability', async ( { browser, apiRequests }, testInfo ) => {
		await test.step( 'Test capability enforcement for global classes operations', async () => {
			// This test verifies that the capability system properly prevents unauthorized global classes operations
			const context = await browser.newContext( { storageState: undefined } );
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

			await wpAdmin.customLogin( testUser.username, testUser.password );

			// Enable experiments
			await wpAdmin.setExperiments( {
				e_atomic_elements: 'active',
				e_classes: 'active',
			} );

			const editor = await wpAdmin.openNewPage( false, false );

			// Add a widget
			await editor.addWidget( { widgetType: 'e-heading' } );

			// Try to make API calls to global classes endpoints (should fail due to capability check)
			const globalClassesApiResponse = await page.evaluate( async () => {
				try {
					const response = await fetch( '/wp-json/elementor/v1/global-classes', {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'X-WP-Nonce': window.ElementorConfig?.nonce || '',
						},
						body: JSON.stringify( {
							items: {},
							order: [],
							changes: { added: [], deleted: [], modified: [] },
						} ),
					} );
					return {
						status: response.status,
						ok: response.ok,
					};
				} catch ( error ) {
					return {
						status: 0,
						ok: false,
						error: error.message,
					};
				}
			} );

			// The API should reject the request due to insufficient capabilities
			expect( globalClassesApiResponse.ok ).toBe( false );
			expect( [ 401, 403 ] ).toContain( globalClassesApiResponse.status );

			// Reset experiments
			await wpAdmin.resetExperiments();
			await context.close();
		} );
	} );
} );
