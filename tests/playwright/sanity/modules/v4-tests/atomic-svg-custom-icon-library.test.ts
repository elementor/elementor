import { expect } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

const SVG_CONTROL_TEST_ID = 'svg-media-control-container';
const CUSTOM_LIBRARY_LABEL = 'PW Fontello';
const CUSTOM_ICON_LABEL = 'emo surprised';
const CUSTOM_ICON_PATH = 'M0 0H100V100H0Z';
const EVAL_FILE_PREFIX = 'wp eval-file wp-content/plugins/elementor/tests/playwright/setup';

test.describe( 'Atomic SVG custom icon libraries @v4-tests', () => {
	test.beforeAll( async () => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements,e_svg_library' );
		await wpCli( `${ EVAL_FILE_PREFIX }/install-pw-custom-icon-library.php` );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		await wpCli( `${ EVAL_FILE_PREFIX }/uninstall-pw-custom-icon-library.php` );

		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'lists a Fontello pack and paints it on the canvas', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-svg', container: containerId } );
		await editor.v4Panel.openTab( 'general' );

		const svgControl = page.getByTestId( SVG_CONTROL_TEST_ID );
		await expect( svgControl ).toBeVisible();
		await svgControl.hover();
		await page.getByRole( 'button', { name: 'Icon library' } ).click();

		const popover = page.locator( '#icon-library' );
		await expect( popover ).toBeVisible();

		await test.step( 'Filter My libraries and select the Fontello icon', async () => {
			await popover.getByRole( 'button', { name: 'Filter by library' } ).click();

			const filterMenu = page.getByRole( 'menu', { name: 'Filter by library' } );

			await expect( filterMenu.getByText( 'My libraries' ) ).toBeVisible();
			await filterMenu.getByRole( 'menuitemcheckbox', { name: CUSTOM_LIBRARY_LABEL } ).click();
			await page.keyboard.press( 'Escape' );

			const option = popover.getByRole( 'option', { name: CUSTOM_ICON_LABEL } );

			await expect( option ).toBeVisible();
			await expect( option.locator( 'svg path' ) ).toHaveAttribute( 'd', CUSTOM_ICON_PATH );
			await option.click();
			await expect( popover ).toBeHidden();
		} );

		await test.step( 'Canvas renders the Fontello path as inline svg', async () => {
			const preview = editor.getPreviewFrame();
			const path = preview.locator( '.e-svg-base svg path' );

			await expect( path ).toHaveAttribute( 'd', CUSTOM_ICON_PATH );
		} );
	} );
} );
