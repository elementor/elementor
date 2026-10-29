import { expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'Atomic panel New badge (ED-25847) @v4-tests', () => {
	test.beforeAll( async () => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	const expectNewBadgeOnTile = async (
		page: Page,
		categorySelector: string,
		libraryElementType: string
	) => {
		const tile = page.locator(
			`${ categorySelector } .elementor-panel-category-items [data-library-element-type="${ libraryElementType }"]`
		);
		await expect( tile ).toBeVisible();
		await expect( tile.locator( '.e-widget-new-badge' ) ).toBeVisible();
	};

	test( 'v4-elements tiles show New badge for 4.4 atoms', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.openElementsPanel();

		const categorySelector = '#elementor-panel-category-v4-elements';

		await expectNewBadgeOnTile( page, categorySelector, 'e-list' );
		await expectNewBadgeOnTile( page, categorySelector, 'e-svg' );
		await expectNewBadgeOnTile( page, categorySelector, 'e-google-maps' );
	} );
} );
