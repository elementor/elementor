import { expect, type Page } from '@playwright/test';
import { resolve } from 'path';
import {
	CURRENT_PUBLISHED_CORE_VERSION,
	isCoreVersionAbovePublished,
	readCoreVersionFromPluginFile,
} from '../../../assets/core-version';
import { wpCli } from '../../../assets/wp-cli';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

const SVG_CONTROL_TEST_ID = 'svg-media-control-container';
const CUSTOM_LIBRARY_LABEL = 'PW Fontello';
const CUSTOM_ICON_LABEL = 'emo surprised';
const CUSTOM_ICON_PATH_PREFIX = 'M110 849';
const FONTELLO_ZIP = resolve( __dirname, '../../../resources/custom-icon-fontello.zip' );
const EVAL_FILE_PREFIX = 'wp eval-file wp-content/plugins/elementor/tests/playwright/setup';
const CORE_VERSION = readCoreVersionFromPluginFile();
const SUITE_TITLE = 'Atomic SVG custom icons via Pro Custom Icons @v4-tests';

const describeSuite = isCoreVersionAbovePublished( CORE_VERSION )
	? test.describe
	: test.describe.skip;

const adminStorageState = () => ( {
	storageState: `./storageState-${ process.env.TEST_PARALLEL_INDEX }.json`,
} );

const hasProCustomIconsScreen = async ( page: Page ): Promise<boolean> => {
	await page.goto( '/wp-admin/edit.php?post_type=elementor_icons' );

	if ( ! page.url().includes( 'post_type=elementor_icons' ) ) {
		return false;
	}

	const addNew = page.getByRole( 'link', { name: /add new/i } );

	return ( await addNew.count() ) > 0;
};

const uploadFontelloSet = async ( page: Page ): Promise<void> => {
	await page.goto( '/wp-admin/post-new.php?post_type=elementor_icons' );

	const title = page.locator( '#title' );

	await expect( title ).toBeVisible();
	await title.fill( CUSTOM_LIBRARY_LABEL );

	const fileInput = page.locator( 'input[type="file"]' ).first();

	await fileInput.setInputFiles( FONTELLO_ZIP );

	const publish = page.locator( '#publish' );

	await expect( publish ).toBeEnabled();
	await publish.click();
	await expect( page.locator( '#message.updated, .notice-success, .elementor-icon-set-footer' ).first() ).toBeVisible();
};

describeSuite(
	`${ SUITE_TITLE } (Core ${ CORE_VERSION } > ${ CURRENT_PUBLISHED_CORE_VERSION })`,
	() => {
		test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
			const context = await browser.newContext( adminStorageState() );
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

			if ( ! await hasProCustomIconsScreen( page ) ) {
				await page.close();
				await context.close();
				test.skip( true, 'Requires Elementor Pro Custom Icons' );
				return;
			}

			await wpCli( 'wp elementor experiments activate e_atomic_elements,e_svg_library' );
			await wpAdmin.enableAdvancedUploads();
			await uploadFontelloSet( page );
			await page.close();
			await context.close();
		} );

		test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
			await wpCli( `${ EVAL_FILE_PREFIX }/uninstall-pw-pro-custom-icon-set.php` );

			const context = await browser.newContext( adminStorageState() );
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.resetExperiments();
			await page.close();
			await context.close();
		} );

		test( 'lists a Pro-uploaded Fontello pack and paints it on the canvas', async ( { page, apiRequests }, testInfo ) => {
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
				await expect( option.locator( 'svg path' ) ).toHaveAttribute( 'd', new RegExp( `^${ CUSTOM_ICON_PATH_PREFIX }` ) );
				await option.click();
				await expect( popover ).toBeHidden();
			} );

			await test.step( 'Canvas renders the Fontello path as inline svg', async () => {
				const preview = editor.getPreviewFrame();
				const path = preview.locator( '.e-svg-base svg path' );

				await expect( path ).toHaveAttribute( 'd', new RegExp( `^${ CUSTOM_ICON_PATH_PREFIX }` ) );
			} );
		} );
	},
);
