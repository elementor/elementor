import { expect } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

const SVG_CONTROL_TEST_ID = 'svg-media-control-container';
const SCREENSHOT_OPTIONS = { animations: 'disabled' as const };
const MISSING_ICON_QUERY = 'zzzxnotanicon';

test.describe( 'Atomic SVG icon library @v4-tests', () => {
	test.beforeAll( async () => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements,e_svg_library' );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'SVG control overlay and icon library popover match expected visuals', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-svg', container: containerId } );
		await editor.v4Panel.openTab( 'general' );

		const svgControl = page.getByTestId( SVG_CONTROL_TEST_ID );
		await expect( svgControl ).toBeVisible();

		await test.step( 'Hover overlay shows Select, Upload, and Icon library', async () => {
			await svgControl.hover();
			await expect( page.getByRole( 'button', { name: 'Icon library' } ) ).toBeVisible();
			await expect( svgControl ).toHaveScreenshot( 'svg-control-hover.png', SCREENSHOT_OPTIONS );
		} );

		const popover = page.locator( '#icon-library' );

		await test.step( 'Icon library popover lists glyphs', async () => {
			await page.getByRole( 'button', { name: 'Icon library' } ).click();
			await expect( popover.getByRole( 'option' ).first() ).toBeVisible();
			await expect( popover.getByRole( 'button', { name: 'Filter by library' } ) ).toBeVisible();
			await expect( popover ).toHaveScreenshot( 'icon-library-popover.png', SCREENSHOT_OPTIONS );
		} );

		await test.step( 'Library filter composes with search', async () => {
			const search = popover.getByPlaceholder( 'Search' );

			await search.fill( 'github' );
			await popover.getByRole( 'button', { name: /^Filter by library/ } ).click();
			await page.getByRole( 'menuitemcheckbox', { name: 'Font Awesome - Solid' } ).click();
			await page.keyboard.press( 'Escape' );
			await expect( popover.getByText( /Sorry, nothing matched/ ) ).toBeVisible();
			await expect( search ).toHaveValue( 'github' );

			await popover.getByRole( 'button', { name: /^Filter by library/ } ).click();
			await page.getByRole( 'menuitemcheckbox', { name: 'Font Awesome - Brands' } ).click();
			await page.keyboard.press( 'Escape' );
			await expect( popover.getByRole( 'option', { name: /github/i } ).first() ).toBeVisible();
			await expect( popover.getByRole( 'button', { name: 'Filter by library, active' } ) ).toBeVisible();

			await popover.getByRole( 'button', { name: /^Filter by library/ } ).click();
			await page.getByRole( 'menuitemcheckbox', { name: 'All icons' } ).click();
			await page.keyboard.press( 'Escape' );
			await search.fill( '' );
			await expect( popover.getByRole( 'option' ).first() ).toBeVisible();
		} );

		await test.step( 'Hovered row is visually highlighted', async () => {
			await popover.getByRole( 'option' ).nth( 1 ).hover();
			await expect( popover ).toHaveScreenshot( 'icon-library-option-hover.png', SCREENSHOT_OPTIONS );
		} );

		await test.step( 'Selected icon is highlighted when the library reopens', async () => {
			await popover.getByRole( 'option' ).first().click();
			await expect( popover ).toBeHidden();

			await svgControl.hover();
			await page.getByRole( 'button', { name: 'Icon library' } ).click();
			await expect( popover.getByRole( 'option', { selected: true } ) ).toBeVisible();
			await expect( popover ).toHaveScreenshot( 'icon-library-selected.png', SCREENSHOT_OPTIONS );
		} );

		await test.step( 'Empty search shows the no-results state', async () => {
			await popover.getByPlaceholder( 'Search' ).fill( MISSING_ICON_QUERY );
			await expect( popover.getByText( /Sorry, nothing matched/ ) ).toBeVisible();
			await expect( popover ).toHaveScreenshot( 'icon-library-no-results.png', SCREENSHOT_OPTIONS );
		} );
	} );
} );
