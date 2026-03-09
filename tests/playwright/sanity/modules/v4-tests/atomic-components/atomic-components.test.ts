import { BrowserContext, expect, Locator, Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import EditorSelectors from '../../../../selectors/editor-selectors';

import { createContentForComponent } from './utils/creation';

test.describe( 'Atomic Components @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;
	let page: Page;

	const proMockScript = `<script>window.elementorPro = { config: { isActive: true, version: '3.35.0' } };</script>`;

	const proMockRouteHandler = async ( route: import( '@playwright/test' ).Route ) => {
		const response = await route.fetch();
		const contentType = response.headers()[ 'content-type' ] ?? '';

		if ( ! contentType.includes( 'text/html' ) ) {
			await route.fulfill( { response } );
			return;
		}

		const html = await response.text();
		await route.fulfill( {
			response,
			body: html.replace( '<head>', `<head>${ proMockScript }` ),
		} );
	};

	const proMockRoutePattern = ( url: URL ) => 'elementor' === url.searchParams.get( 'action' );

	const enableProMock = async () => {
		await page.route( proMockRoutePattern, proMockRouteHandler );
	};

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_atomic_elements: 'active',
			e_components: 'active',
		} );
	} );

	test.afterAll( async () => {
		await wpAdminPage?.resetExperiments();
		await context?.close();
	} );

	test.beforeEach( async () => {
		await enableProMock();
		editor = await wpAdminPage.openNewPage();
	} );

	test.describe( 'Pro gating on canvas actions', () => {
		const mockProState = async ( targetPage: Page, state: { installed: boolean; active: boolean } ) => {
			await targetPage.evaluate( ( { installed, active } ) => {
				const w = window as unknown as Record< string, unknown >;

				if ( installed ) {
					w.elementorPro = { config: { isActive: active } };
				} else {
					delete w.elementorPro;
				}
			}, state );
		};

		test( 'should show PRO badge and disable "Create component" when Pro is not active', async () => {
			let flexbox: Locator;

			await test.step( 'Mock no-pro state and add a flexbox', async () => {
				await mockProState( page, { installed: false, active: false } );
				const { locator } = await createContentForComponent( editor );
				flexbox = locator;
			} );

			await test.step( 'Right-click and verify create-component is disabled with PRO badge', async () => {
				await flexbox.click( { button: 'right' } );
				await page.waitForSelector( EditorSelectors.contextMenu.menu );

				const createItem = page.getByRole( 'menuitem', { name: 'Create component' } );
				await expect( createItem ).toBeVisible();

				const proBadge = createItem.locator( 'a[href*="go-pro-components-create"]' );
				await expect( proBadge ).toBeVisible();
				await expect( proBadge ).toHaveText( 'PRO' );
			} );
		} );
	} );
} );
