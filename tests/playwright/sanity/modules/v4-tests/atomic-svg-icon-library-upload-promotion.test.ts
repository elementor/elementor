import { expect, type Page } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

const SVG_CONTROL_TEST_ID = 'svg-media-control-container';
const UPLOAD_BUTTON_NAME = 'Upload library';
const UPGRADE_URL_PATTERN = /go-pro-svg-library-upload-upgrade/;

type TestUser = { id: string; username: string; password: string };

const openIconLibrary = async ( page: Page ) => {
	const svgControl = page.getByTestId( SVG_CONTROL_TEST_ID );
	await expect( svgControl ).toBeVisible();
	await svgControl.hover();
	await page.getByRole( 'button', { name: 'Icon library' } ).click();

	const popover = page.locator( '#icon-library' );
	await expect( popover ).toBeVisible();

	return popover;
};

test.describe( 'Atomic SVG icon library upload promotion @v4-tests', () => {
	let editorUser: TestUser;

	test.beforeAll( async ( { browser, apiRequests } ) => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );

		const context = await browser.newContext();
		const page = await context.newPage();

		editorUser = await apiRequests.createNewUser( page.context().request, {
			username: 'iconLibraryEditor',
			password: 'password',
			email: 'icon-library-editor@test.com',
			roles: [ 'editor' ],
		} );

		await context.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		if ( editorUser?.id ) {
			try {
				await apiRequests.deleteUser( page.context().request, editorUser.id );
			} catch {
				// Cleanup must not fail the run.
			}
		}

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'Admin without Pro sees the upload action and its upgrade promotion', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-svg', container: containerId } );
		await editor.v4Panel.openTab( 'general' );

		const popover = await openIconLibrary( page );
		const uploadButton = popover.getByRole( 'button', { name: UPLOAD_BUTTON_NAME } );

		await test.step( 'Upload action is visible in the library header', async () => {
			await expect( uploadButton ).toBeVisible();
		} );

		await test.step( 'Clicking it opens the upgrade promotion', async () => {
			await uploadButton.click();

			const promotion = page.getByRole( 'dialog' );
			await expect( promotion.getByText( 'Upload custom icons' ) ).toBeVisible();
			await expect( promotion.getByRole( 'link', { name: 'Upgrade now' } ) ).toHaveAttribute(
				'href',
				UPGRADE_URL_PATTERN,
			);
		} );

		await test.step( 'Closing the promotion keeps the library open', async () => {
			await page.getByRole( 'dialog' ).getByRole( 'button', { name: /close/i } ).click();
			await expect( page.getByRole( 'dialog' ) ).toBeHidden();
			await expect( popover ).toBeVisible();
		} );
	} );

	test( 'Non-admin without Pro does not see the upload action', async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext( { storageState: undefined } );
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.customLogin( editorUser.username, editorUser.password );

		const editor = await wpAdmin.openNewPage( false, false );
		await editor.closeNavigatorIfOpen();

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-svg', container: containerId } );
		await editor.v4Panel.openTab( 'general' );

		const popover = await openIconLibrary( page );

		await expect( popover.getByRole( 'button', { name: 'Switch to list view' } ) ).toBeVisible();
		await expect( popover.getByRole( 'button', { name: UPLOAD_BUTTON_NAME } ) ).toHaveCount( 0 );

		await context.close();
	} );
} );
