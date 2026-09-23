import { type APIRequestContext, expect, type Locator, type Page } from '@playwright/test';
import type ApiRequests from '../../../../assets/api-requests';
import { timeouts } from '../../../../config/timeouts';
import EditorPage from '../../../../pages/editor-page';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../../parallelTest';
import TopBarSelectors from '../../../../selectors/top-bar-selectors';
import { deleteAllGlobalClasses, publishAndWaitForClassesSave } from './utils';

const EXPERIMENTS = { e_atomic_elements: 'active' } as const;
const CLASS_NAME = 'unpublished-class';
const BACKGROUND_COLOR = {
	hex: '#FF0000',
	rgb: 'rgb(255, 0, 0)',
} as const;

async function addStyledClass( page: Page, editor: EditorPage ): Promise< string > {
	const widgetId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
	await editor.selectElement( widgetId );
	await editor.v4Panel.openTab( 'style' );
	await editor.v4Panel.style.addGlobalClass( CLASS_NAME );
	await page.waitForTimeout( timeouts.short );
	await editor.v4Panel.style.selectClassState( 'normal', CLASS_NAME );
	await editor.v4Panel.style.openSection( 'Background' );
	await editor.v4Panel.style.setBackgroundColor( BACKGROUND_COLOR.hex );

	return widgetId;
}

async function saveDraftAndWaitForClassesSave( page: Page, editor: EditorPage ): Promise< void > {
	const [ response ] = await Promise.all( [
		page.waitForResponse(
			( candidate ) => candidate.url().includes( 'global-classes' ) && 'PUT' === candidate.request().method(),
			{ timeout: timeouts.longAction },
		),
		( async () => {
			await editor.clickTopBarItem( TopBarSelectors.saveOptions );
			await page.getByRole( 'menuitem', { name: 'Save Draft' } ).click();
		} )(),
	] );

	expect( response.ok() ).toBe( true );
}

async function getClassLabels(
	apiRequests: ApiRequests,
	request: APIRequestContext,
	context: 'preview' | 'frontend',
): Promise< string[] > {
	const route = `index.php?rest_route=/elementor/v1/global-classes&context=${ context }`;
	const response = await apiRequests.customGet( request, route );
	const classes: Array< { label: string } > = Array.isArray( response?.data ) ? response.data : [];

	return classes.map( ( item ) => item.label );
}

async function expectClassRegistry(
	apiRequests: ApiRequests,
	request: APIRequestContext,
	context: 'preview' | 'frontend',
	containsClass: boolean,
): Promise< void > {
	await expect
		.poll( async () => {
			const labels = await getClassLabels( apiRequests, request, context );

			return labels.includes( CLASS_NAME );
		}, { timeout: timeouts.longAction } )
		.toBe( containsClass );
}

async function openExistingPageEditor(
	page: Page,
	editor: EditorPage,
	postId: number,
): Promise< void > {
	await page.goto( `/wp-admin/post.php?post=${ postId }&action=elementor` );
	await page.waitForLoadState( 'load', { timeout: timeouts.longAction } );
	await editor.waitForPanelToLoad();
}

async function getComputedBackground( locator: Locator ): Promise< string > {
	return locator.evaluate( ( element ) => getComputedStyle( element ).backgroundColor );
}

test.describe.serial( 'Global Classes - Unpublished class persistence @v4-tests', () => {
	let editor: EditorPage;
	let page: Page;
	let wpAdmin: WpAdminPage;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		page = await browser.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( EXPERIMENTS );
	} );

	test.afterAll( async ( { apiRequests, request } ) => {
		await deleteAllGlobalClasses( apiRequests, request );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'keeps a preview-only class when another page is published', async ( { apiRequests, request } ) => {
		let pageAId: number;
		let widgetId: string;

		await test.step( 'Create and draft-save a styled class on page A', async () => {
			editor = await wpAdmin.openNewPage();
			pageAId = Number( await editor.getPageId() );
			widgetId = await addStyledClass( page, editor );

			await saveDraftAndWaitForClassesSave( page, editor );
			await expectClassRegistry( apiRequests, request, 'preview', true );
			await expectClassRegistry( apiRequests, request, 'frontend', false );
		} );

		await test.step( 'Publish page B without dropping page A class from preview', async () => {
			editor = await wpAdmin.openNewPage();
			await publishAndWaitForClassesSave( editor, page );

			await expectClassRegistry( apiRequests, request, 'preview', true );
			await expectClassRegistry( apiRequests, request, 'frontend', false );
		} );

		await test.step( 'Publish page A and resolve its class on the frontend', async () => {
			await openExistingPageEditor( page, editor, pageAId );
			const widget = await editor.getWidget( widgetId );
			await expect.poll( () => getComputedBackground( widget ), { timeout: timeouts.expect } )
				.toBe( BACKGROUND_COLOR.rgb );

			await publishAndWaitForClassesSave( editor, page );
			await expectClassRegistry( apiRequests, request, 'frontend', true );

			await page.goto( `/?p=${ pageAId }` );
			await page.waitForLoadState( 'domcontentloaded', { timeout: timeouts.longAction } );
			const publishedWidget = page.locator( `[data-id="${ widgetId }"]` );
			await expect.poll( () => getComputedBackground( publishedWidget ), { timeout: timeouts.expect } )
				.toBe( BACKGROUND_COLOR.rgb );
		} );
	} );
} );
