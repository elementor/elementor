import { BrowserContext, expect, Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import EditorPage from '../../../pages/editor-page';
import WpAdminPage from '../../../pages/wp-admin-page';

type ExtendedWindow = Window & {
	__createWidgetPrompt: string;
};

test.describe( 'Widget Creation @widget-creation', () => {
	const EXPERIMENT_NAME = 'e_widget_creation';
	const WIDGET_SEARCH_INPUT = 'input#elementor-panel-elements-search-input';
	const WIDGET_CREATION_CTA = '.elementor-panel-elements-widget-creation__cta';
	const WIDGET_CREATION_TITLE = '.elementor-panel-elements-widget-creation__title';
	const WIDGET_CREATION_MESSAGE = '.elementor-panel-elements-widget-creation__message';
	const CREATE_WIDGET_MODAL = '[role="dialog"].MuiDialog-paper';
	const INSTALL_ANGIE_BUTTON = 'button:has-text("Install Angie")';
	const SEARCH_RESULTS = '#elementor-panel-elements .elementor-element-wrapper .elementor-element';
	const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';

	async function searchWidgets( page: Page, searchTerm: string ) {
		const searchInput = page.locator( WIDGET_SEARCH_INPUT );
		await searchInput.clear();
		await searchInput.pressSequentially( searchTerm, { delay: 50 } );
	}

	async function clearSearch( page: Page ) {
		const searchInput = page.locator( WIDGET_SEARCH_INPUT );
		await searchInput.fill( '' );
		await searchInput.dispatchEvent( 'input' );
	}

	test.describe( 'Angie Not Installed', () => {
		let context: BrowserContext;
		let page: Page;
		let wpAdmin: WpAdminPage;
		let editor: EditorPage;

		test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
			context = await browser.newContext();
			page = await context.newPage();
			wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( { [ EXPERIMENT_NAME ]: 'active' } );
		} );

		test.afterAll( async () => {
			await context?.close();
		} );

		test( 'Widget creation CTA and modal functionality', async () => {
			editor = await wpAdmin.openNewPage();
			await editor.openElementsPanel();

			await test.step( 'Search with results shows widget creation footer', async () => {
				await searchWidgets( page, 'button' );

				const searchResults = page.locator( SEARCH_RESULTS );
				await expect( searchResults.first() ).toBeVisible();
				const resultCount = await searchResults.count();
				expect( resultCount ).toBeGreaterThan( 0 );

				const cta = page.locator( WIDGET_CREATION_CTA );
				await cta.scrollIntoViewIfNeeded();
				await expect( cta ).toBeVisible();
				await expect( cta ).toContainText( 'Create custom widget' );

				const title = page.locator( WIDGET_CREATION_TITLE );
				await expect( title ).toHaveText( "Couldn't find what you're looking for?" );

				const message = page.locator( WIDGET_CREATION_MESSAGE );
				await expect( message ).toContainText( 'Build a custom widget with Angie' );
			} );

			await test.step( 'Search with no results shows empty state with search term', async () => {
				const nonExistentWidget = 'xyznonexistentwidget123';
				await searchWidgets( page, nonExistentWidget );

				const searchResults = page.locator( SEARCH_RESULTS );
				await expect( searchResults ).toHaveCount( 0 );

				const cta = page.locator( WIDGET_CREATION_CTA );
				await cta.scrollIntoViewIfNeeded();
				await expect( cta ).toBeVisible();

				const title = page.locator( WIDGET_CREATION_TITLE );
				await expect( title ).toContainText( 'No widget found for' );
				await expect( title ).toContainText( nonExistentWidget );
			} );

			await test.step( 'Clicking CTA opens Angie promotion modal', async () => {
				await searchWidgets( page, 'heading' );

				const cta = page.locator( WIDGET_CREATION_CTA );
				await cta.click();

				const modal = page.locator( CREATE_WIDGET_MODAL );
				await expect( modal ).toBeVisible();
				await expect( modal ).toContainText( 'Install Angie to build custom widgets' );
				await expect( modal ).toContainText( 'Angie lets you generate custom widgets' );

				const installButton = modal.locator( INSTALL_ANGIE_BUTTON );
				await expect( installButton ).toBeVisible();
			} );

			await test.step( 'Modal can be closed', async () => {
				const modal = page.locator( CREATE_WIDGET_MODAL );
				const closeButton = modal.locator( 'button[aria-label="Close"]' );
				await closeButton.click();

				await expect( modal ).toBeHidden();
			} );

			await test.step( 'CTA dispatches create-widget event', async () => {
				await page.evaluate( ( eventName ) => {
					window.addEventListener( eventName, ( event: CustomEvent ) => {
						( window as unknown as ExtendedWindow ).__createWidgetPrompt = event.detail?.prompt;
					} );
				}, CREATE_WIDGET_EVENT );

				await searchWidgets( page, 'customwidget' );

				const cta = page.locator( WIDGET_CREATION_CTA );
				await cta.click();

				const eventPrompt = await page.evaluate( () => {
					return ( window as unknown as ExtendedWindow ).__createWidgetPrompt;
				} );
				expect( eventPrompt ).toContain( 'Create a widget for me' );

				const modal = page.locator( CREATE_WIDGET_MODAL );
				const closeButton = modal.locator( 'button[aria-label="Close"]' );
				await closeButton.click();
				await expect( modal ).toBeHidden();
			} );

			await test.step( 'Clicking Install navigates to plugin install page', async () => {
				await clearSearch( page );
				await searchWidgets( page, 'divider' );

				const cta = page.locator( WIDGET_CREATION_CTA );
				await cta.click();

				const modal = page.locator( CREATE_WIDGET_MODAL );
				await expect( modal ).toBeVisible();

				const installButton = modal.locator( INSTALL_ANGIE_BUTTON );
				await installButton.click();

				await page.waitForURL( /admin\.php.*angie-app/ );
				expect( page.url() ).toContain( 'admin.php' );
				expect( page.url() ).toContain( 'angie-app' );
			} );
		} );
	} );

	test.describe( 'Experiment Disabled', () => {
		let context: BrowserContext;
		let page: Page;
		let wpAdmin: WpAdminPage;
		let editor: EditorPage;

		test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
			context = await browser.newContext();
			page = await context.newPage();
			wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( { [ EXPERIMENT_NAME ]: 'inactive' } );
		} );

		test.afterAll( async () => {
			await context?.close();
		} );

		test( 'Widget creation CTA is not shown when experiment is disabled', async () => {
			editor = await wpAdmin.openNewPage();
			await editor.openElementsPanel();

			await test.step( 'CTA not shown with search results', async () => {
				await searchWidgets( page, 'button' );

				const searchResults = page.locator( SEARCH_RESULTS );
				await expect( searchResults.first() ).toBeVisible();

				const cta = page.locator( WIDGET_CREATION_CTA );
				await expect( cta ).toHaveCount( 0 );
			} );

			await test.step( 'CTA not shown with no search results', async () => {
				await searchWidgets( page, 'xyznonexistent456' );

				const title = page.locator( WIDGET_CREATION_TITLE );
				await expect( title ).toHaveCount( 0 );
			} );
		} );
	} );
} );
