import { BrowserContext, expect } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Google Maps Widget @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;

	const widgetType = 'e-google-maps';

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		const page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_atomic_elements: 'active',
		} );
	} );

	test.beforeEach( async () => {
		editor = await wpAdmin.openNewPage();
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'Renders the map iframe in the editor and on the frontend', async () => {
		let widgetId = '';

		await test.step( 'Add widget with the default location', async () => {
			const containerId = await editor.addElement( { elType: 'container' }, 'document' );
			widgetId = await editor.addWidget( { widgetType, container: containerId } );
		} );

		const mapInEditor = editor.getPreviewFrame().locator( `iframe[data-id="${ widgetId }"]` );

		await test.step( 'Default location renders the fallback embed URL', async () => {
			await expect( mapInEditor ).toHaveAttribute( 'src', /maps\.google\.com\/maps\?q=London%20Eye/ );
			await expect( mapInEditor ).toHaveAttribute( 'title', 'London Eye, London, United Kingdom' );
			await expect( mapInEditor ).toHaveAttribute( 'aria-label', 'London Eye, London, United Kingdom' );
			await expect( mapInEditor ).toHaveAttribute( 'loading', 'lazy' );
		} );

		await test.step( 'API key notice is shown when no key is configured', async () => {
			await editor.selectElement( widgetId );
			await editor.v4Panel.openTab( 'general' );
			await expect( editor.page.getByText( 'Connect an API key' ) ).toBeVisible();
		} );

		await test.step( 'Changing the location and zoom updates the iframe', async () => {
			await editor.v4Panel.fillField( 0, 'Eiffel Tower, Paris' );
			await editor.v4Panel.fillField( 1, '15' );

			await expect( mapInEditor ).toHaveAttribute( 'src', /q=Eiffel%20Tower%2C%20Paris&t=m&z=15&/ );
			await expect( mapInEditor ).toHaveAttribute( 'title', 'Eiffel Tower, Paris' );
		} );

		await test.step( 'Clearing the location keeps a selectable placeholder in the editor', async () => {
			await editor.v4Panel.fillField( 0, '' );

			await expect( mapInEditor ).toHaveCount( 0 );
			await expect( editor.getPreviewFrame().locator( `div[data-id="${ widgetId }"][data-e-type="${ widgetType }"]` ) ).toBeVisible();

			await editor.v4Panel.fillField( 0, 'Eiffel Tower, Paris' );
			await expect( mapInEditor ).toHaveAttribute( 'title', 'Eiffel Tower, Paris' );
		} );

		await test.step( 'Frontend renders the same iframe', async () => {
			await editor.publishAndViewPage();

			const mapOnFrontend = editor.page.locator( `iframe[data-id="${ widgetId }"]` );

			await expect( mapOnFrontend ).toHaveAttribute( 'src', /q=Eiffel%20Tower%2C%20Paris&t=m&z=15&/ );
			await expect( mapOnFrontend ).toHaveAttribute( 'title', 'Eiffel Tower, Paris' );
		} );
	} );
} );
