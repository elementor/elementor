import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';

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
		await test.step( 'Setup experiments as admin and then test as editor', async () => {
			// First, login as admin to set experiments
			const adminContext = await browser.newContext( { storageState: undefined } );
			const adminPage = await adminContext.newPage();
			const adminWpAdmin = new WpAdminPage( adminPage, testInfo, apiRequests );

			// Login as admin and set experiments
			await adminWpAdmin.customLogin( process.env.USERNAME || 'admin', process.env.PASSWORD || 'password' );
			await adminWpAdmin.setExperiments( {
				e_atomic_elements: 'active',
				e_classes: 'active', // Enable global classes experiment
			} );

			await adminContext.close();

			// Now login as editor user for the actual test
			const context = await browser.newContext( { storageState: undefined } );
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

			await wpAdmin.customLogin( testUser.username, testUser.password );

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

				// Verify the widget was added successfully
				await expect( headingWidget ).toBeVisible();

				// Attempt to publish the page
				let publishError = false;

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
			} );

			await context.close();

			// Clean up: Reset experiments as admin
			const cleanupContext = await browser.newContext( { storageState: undefined } );
			const cleanupPage = await cleanupContext.newPage();
			const cleanupWpAdmin = new WpAdminPage( cleanupPage, testInfo, apiRequests );

			await cleanupWpAdmin.customLogin( process.env.USERNAME || 'admin', process.env.PASSWORD || 'password' );
			await cleanupWpAdmin.resetExperiments();
			await cleanupContext.close();
		} );
	} );

	test( 'Publishing content with global classes changes requires proper capability', async ( { browser, apiRequests }, testInfo ) => {
		await test.step( 'Test capability enforcement for global classes operations', async () => {
			// First, login as admin to set experiments
			const adminContext = await browser.newContext( { storageState: undefined } );
			const adminPage = await adminContext.newPage();
			const adminWpAdmin = new WpAdminPage( adminPage, testInfo, apiRequests );

			// Login as admin and set experiments
			await adminWpAdmin.customLogin( process.env.USERNAME || 'admin', process.env.PASSWORD || 'password' );
			await adminWpAdmin.setExperiments( {
				e_atomic_elements: 'active',
				e_classes: 'active',
			} );

			await adminContext.close();

			// Now test with editor user
			const context = await browser.newContext( { storageState: undefined } );
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

			await wpAdmin.customLogin( testUser.username, testUser.password );

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

			await context.close();

			// Clean up: Reset experiments as admin
			const cleanupContext = await browser.newContext( { storageState: undefined } );
			const cleanupPage = await cleanupContext.newPage();
			const cleanupWpAdmin = new WpAdminPage( cleanupPage, testInfo, apiRequests );

			await cleanupWpAdmin.customLogin( process.env.USERNAME || 'admin', process.env.PASSWORD || 'password' );
			await cleanupWpAdmin.resetExperiments();
			await cleanupContext.close();
		} );
	} );
} );
