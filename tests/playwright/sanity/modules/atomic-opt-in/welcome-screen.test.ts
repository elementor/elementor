import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'V4 activation welcome modal @promotions', () => {
	test.beforeAll( async () => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
	} );

	test.beforeEach( async () => {
		await wpCli( 'wp option update e_editor_counter 3' );

		await wpCli( 'wp user meta update 1 _e_welcome_popover_displayed 0' );

		await wpCli( `wp eval "update_option( 'elementor_install_history', [ '0.0.1' => 1 ] );"` );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Welcome modal appears and shows expected content', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		const dialog = page.getByRole( 'dialog' ).filter( { hasText: 'Atomic editor' } );
		await expect( dialog ).toBeVisible();

		await test.step( 'Header content', async () => {
			await expect( dialog.getByText( 'now using the Atomic editor' ) ).toBeVisible();
			await expect( dialog.getByText( 'new editing experience is now active' ) ).toBeVisible();
		} );

		await test.step( 'Feature items', async () => {
			await expect( dialog.getByText( 'Use Atomic Elements alongside your existing widgets' ) ).toBeVisible();
			await expect( dialog.getByText( 'Build reusable design systems' ) ).toBeVisible();
			await expect( dialog.getByText( 'Keep styles consistent across your site' ) ).toBeVisible();
			await expect( dialog.getByText( 'Get unparalleled performance' ) ).toBeVisible();
		} );

		await test.step( 'Footer content', async () => {
			await expect( dialog.getByText( 'Need help getting started?' ) ).toBeVisible();
			const learnMoreLink = dialog.getByRole( 'link', { name: 'Learn more' } );
			await expect( learnMoreLink ).toBeVisible();
			await expect( learnMoreLink ).toHaveAttribute( 'href', 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/' );
		} );
	} );

	test( 'Clicking a feature item updates the right panel image', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		const dialog = page.getByRole( 'dialog' ).filter( { hasText: 'Atomic editor' } );
		await expect( dialog ).toBeVisible();

		await dialog.getByText( 'Build reusable design systems' ).click();

		const activeImage = dialog.locator( 'img[alt="Modal image designSystems"]' );
		await expect( activeImage ).toBeVisible();
	} );
} );
