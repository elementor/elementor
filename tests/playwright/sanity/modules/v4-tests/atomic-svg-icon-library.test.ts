import { expect } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

const SVG_CONTROL_TEST_ID = 'svg-media-control-container';
const SCREENSHOT_OPTIONS = { animations: 'disabled' as const };
const MISSING_ICON_QUERY = 'zzzxnotanicon';
const GRID_ICON_TOOLTIP_DELAY_MS = 1000;

const openIconLibrary = async ( page, svgControl, popover ) => {
	await svgControl.hover();
	await page.getByRole( 'button', { name: 'Icon library' } ).click();
	await expect( popover ).toBeVisible();
};

// To be fixed in ED-25581
test.describe.skip( 'Atomic SVG icon library @v4-tests', () => {
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

		await test.step( 'Icon library popover opens in list view', async () => {
			await page.getByRole( 'button', { name: 'Icon library' } ).click();
			await expect( popover.getByRole( 'option' ).first() ).toBeVisible();
			await expect( popover.getByRole( 'button', { name: 'Filter by library' } ) ).toBeVisible();
			await expect( popover.getByRole( 'button', { name: 'List view' } ) ).toBeVisible();
			await expect( popover ).toHaveScreenshot( 'icon-library-popover.png', SCREENSHOT_OPTIONS );
		} );

		await test.step( 'Library filter menu matches expected visuals', async () => {
			await popover.getByRole( 'button', { name: 'Filter by library' } ).click();

			const filterMenu = page.getByRole( 'menu', { name: 'Filter by library' } );

			await expect( filterMenu ).toBeVisible();
			await expect( filterMenu ).toHaveScreenshot( 'icon-library-filter-menu.png', SCREENSHOT_OPTIONS );
			await page.keyboard.press( 'Escape' );
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

		await test.step( 'View menu and grid view match expected visuals', async () => {
			await popover.getByRole( 'button', { name: 'List view' } ).click();

			const viewMenu = page.getByRole( 'menu', { name: 'View' } );

			await expect( viewMenu ).toBeVisible();
			await expect( viewMenu ).toHaveScreenshot( 'icon-library-view-menu.png', SCREENSHOT_OPTIONS );
			await page.getByRole( 'menuitemradio', { name: 'Grid' } ).click();
			await expect( popover.getByRole( 'gridcell' ).first() ).toBeVisible();
			await expect( popover ).toHaveScreenshot( 'icon-library-grid-view.png', SCREENSHOT_OPTIONS );
		} );

		await test.step( 'Hovered row is visually highlighted', async () => {
			await popover.getByRole( 'button', { name: 'Grid view' } ).click();
			await page.getByRole( 'menuitemradio', { name: 'List' } ).click();
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

	test( 'Icon library keeps view, filter, and delayed grid tooltips', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-svg', container: containerId } );
		await editor.v4Panel.openTab( 'general' );

		const svgControl = page.getByTestId( SVG_CONTROL_TEST_ID );
		const popover = page.locator( '#icon-library' );

		await openIconLibrary( page, svgControl, popover );
		await expect( popover.getByRole( 'option' ).first() ).toBeVisible();

		await test.step( 'Switching views does not reset the library filter', async () => {
			const search = popover.getByPlaceholder( 'Search' );

			await search.fill( 'github' );
			await popover.getByRole( 'button', { name: 'Filter by library' } ).click();
			await page.getByRole( 'menuitemcheckbox', { name: 'Font Awesome - Brands' } ).click();
			await page.keyboard.press( 'Escape' );
			await expect( popover.getByRole( 'button', { name: 'Filter by library, active' } ) ).toBeVisible();
			await expect( popover.getByRole( 'option', { name: /github/i } ).first() ).toBeVisible();

			await popover.getByRole( 'button', { name: 'List view' } ).click();
			await page.getByRole( 'menuitemradio', { name: 'Grid' } ).click();

			await expect( search ).toHaveValue( 'github' );
			await expect( popover.getByRole( 'button', { name: 'Filter by library, active' } ) ).toBeVisible();
			await expect( popover.getByRole( 'gridcell', { name: /github/i } ).first() ).toBeVisible();
			await expect( popover.getByRole( 'gridcell', { name: /star/i } ) ).toHaveCount( 0 );

			await popover.getByRole( 'button', { name: 'Grid view' } ).click();
			await page.getByRole( 'menuitemradio', { name: 'List' } ).click();

			await expect( search ).toHaveValue( 'github' );
			await expect( popover.getByRole( 'button', { name: 'Filter by library, active' } ) ).toBeVisible();
			await expect( popover.getByRole( 'option', { name: /github/i } ).first() ).toBeVisible();
		} );

		await test.step( 'Grid icon names appear in a tooltip after one second', async () => {
			await popover.getByRole( 'button', { name: 'List view' } ).click();
			await page.getByRole( 'menuitemradio', { name: 'Grid' } ).click();

			const githubCell = popover.getByRole( 'gridcell', { name: /github/i } ).first();

			await page.clock.install();
			await githubCell.hover();
			await expect( page.getByRole( 'tooltip', { name: /github/i } ) ).toHaveCount( 0 );
			await page.clock.fastForward( GRID_ICON_TOOLTIP_DELAY_MS );
			await expect( page.getByRole( 'tooltip', { name: /github/i } ).first() ).toBeVisible();
			await page.clock.resume();
		} );

		await test.step( 'Selected view persists after close and reopen', async () => {
			await popover.getByRole( 'button', { name: 'close' } ).click();
			await expect( popover ).toBeHidden();
			await openIconLibrary( page, svgControl, popover );
			await expect( popover.getByRole( 'gridcell' ).first() ).toBeVisible();
			await expect( popover.getByRole( 'button', { name: 'Grid view' } ) ).toBeVisible();
		} );
	} );
} );
