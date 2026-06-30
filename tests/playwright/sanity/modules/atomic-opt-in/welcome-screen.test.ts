import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect, type BrowserContext, type Locator } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'V4 activation welcome modal @promotions', () => {
	let context: BrowserContext;
	let wpAdmin: WpAdminPage;
	let dialog: Locator;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		const page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_atomic_elements: 'active',
			e_opt_in_v4: 'active',
		} );
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		await wpCli( 'wp option update e_editor_counter 3' );
		await wpCli( 'wp user meta update 1 _e_welcome_popover_displayed 0' );
		await wpCli( "wp eval update_option('elementor_install_history',['0.0.1'=>1]);" );

		const testWpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await testWpAdmin.openNewPage();

		dialog = page.getByRole( 'dialog' ).filter( { hasText: 'Atomic editor' } );
	} );

	test.afterAll( async () => {
		await wpCli( 'wp user meta delete 1 _e_welcome_popover_displayed' );
		await wpAdmin?.resetExperiments();
		await context?.close();
	} );

	test( 'Welcome modal shows header content', async () => {
		await expect( dialog ).toBeVisible();
		await expect( dialog.getByText( 'now using the Atomic editor' ) ).toBeVisible();
		await expect( dialog.getByText( 'new editing experience is now active' ) ).toBeVisible();
	} );

	test( 'Welcome modal shows feature items', async () => {
		await expect( dialog ).toBeVisible();
		await expect( dialog.getByText( 'Use Atomic Elements alongside your existing widgets' ) ).toBeVisible();
		await expect( dialog.getByText( 'Build reusable design systems' ) ).toBeVisible();
		await expect( dialog.getByText( 'Keep styles consistent across your site' ) ).toBeVisible();
		await expect( dialog.getByText( 'Get unparalleled performance' ) ).toBeVisible();
	} );

	test( 'clicking an item updates the right panel image', async () => {
		await expect( dialog ).toBeVisible();
		await dialog.getByText( 'Build reusable design systems' ).click();

		await expect( dialog.getByAltText( 'Modal image designSystems' ) ).toBeVisible();
	} );

	test( 'Welcome modal shows footer', async () => {
		await expect( dialog ).toBeVisible();
		await expect( dialog.getByText( 'Need help getting started?' ) ).toBeVisible();
		const learnMoreLink = dialog.getByRole( 'link', { name: 'Learn more' } );
		await expect( learnMoreLink ).toBeVisible();
		await expect( learnMoreLink ).toHaveAttribute( 'href', 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/' );
		await expect( learnMoreLink ).toHaveAttribute( 'target', '_blank' );
	} );

	test( 'Modal can be closed', async ( { page } ) => {
		await expect( dialog ).toBeVisible();
		await page.keyboard.press( 'Escape' );

		await expect( dialog ).toBeHidden();
	} );
} );
