import { type APIRequestContext, expect, type Locator, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import type ApiRequests from '../../../../assets/api-requests';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';
import {
	deleteAllGlobalClasses,
	deleteClassFromClassManager,
	openClassManager,
	reorderClassInClassManager,
	saveAndCloseClassManager,
} from './utils';

const EXPERIMENTS = { e_atomic_elements: 'active', e_classes: 'active' } as const;

const CLASS_A = 'cross-class-a';
const CLASS_B = 'cross-class-b';
const CLASS_C = 'cross-class-c';
const CLASS_D = 'cross-class-d';
const CLASS_E = 'cross-class-e';
const CLASS_E_RENAMED = 'cross-renamed';

const COLOR = {
	a: { hex: '#FF0000', rgb: 'rgb(255, 0, 0)' },
	b: { hex: '#0000FF', rgb: 'rgb(0, 0, 255)' },
	c: { hex: '#00FF00', rgb: 'rgb(0, 255, 0)' },
	d: { hex: '#FFFF00', rgb: 'rgb(255, 255, 0)' },
	e: { hex: '#FF00FF', rgb: 'rgb(255, 0, 255)' },
} as const;

function getComputedBackground( locator: Locator ): Promise< string > {
	return locator.evaluate( ( el ) => getComputedStyle( el ).backgroundColor );
}

async function addDivBlockWithStyleTab( editor: EditorPage ): Promise< string > {
	const id = await editor.addElement( { elType: 'e-div-block' }, 'document' );
	await editor.selectElement( id );
	await editor.v4Panel.openTab( 'style' );
	return id;
}

async function createAndApplyStyledClass( page: Page, editor: EditorPage, label: string, hex: string ): Promise< void > {
	await editor.v4Panel.style.addGlobalClass( label );
	await page.waitForTimeout( timeouts.short );
	await editor.v4Panel.style.selectClassState( 'normal', label );
	await editor.v4Panel.style.openSection( 'Background' );
	await editor.v4Panel.style.setBackgroundColor( hex );
}

// Typing an existing label and pressing Enter re-applies the existing class
// instead of creating a duplicate (the "create" option is suppressed on an exact match).
async function applyExistingClass( page: Page, editor: EditorPage, label: string ): Promise< void > {
	await editor.v4Panel.style.addGlobalClass( label );
	await page.waitForTimeout( timeouts.short );
}

async function openExistingPageEditor( page: Page, editor: EditorPage, postId: number ): Promise< void > {
	await page.goto( `/wp-admin/post.php?post=${ postId }&action=elementor` );
	await page.waitForLoadState( 'load', { timeout: 20000 } );
	await editor.waitForPanelToLoad();
}

async function publishAndWaitForClassesSave( editor: EditorPage, page: Page ): Promise< void > {
	const [ response ] = await Promise.all( [
		page.waitForResponse(
			( res ) => res.url().includes( 'global-classes' ) && 'PUT' === res.request().method(),
			{ timeout: timeouts.longAction },
		),
		editor.publishPage(),
	] );

	if ( ! response.ok() ) {
		throw new Error( `Global classes save failed: ${ response.status() } ${ await response.text() }` );
	}
}

async function assertCanvasWidgetBackground( editor: EditorPage, widgetId: string, expectedRgb: string ): Promise< void > {
	const widget = await editor.getWidget( widgetId );
	await expect.poll( () => getComputedBackground( widget ), { timeout: timeouts.heavyAction } ).toBe( expectedRgb );
}

async function assertPublishedWidgetBackground( page: Page, postId: number, widgetId: string, expectedRgb: string ): Promise< void > {
	await page.goto( `/?p=${ postId }` );
	await page.waitForLoadState( 'domcontentloaded', { timeout: timeouts.longAction } );

	const widget = page.locator( `[data-id="${ widgetId }"]` );
	await expect( widget ).toBeVisible( { timeout: timeouts.navigation } );
	await expect.poll( () => getComputedBackground( widget ), { timeout: timeouts.expect } ).toBe( expectedRgb );
}

// The Class Manager list is virtualised, so DOM scanning misses off-screen rows.
// Using the REST API is the authoritative and non-brittle way to assert order,
// and it directly validates the bug regression (preview/frontend order divergence).
async function getApiOrderLabels( apiRequests: ApiRequests, request: APIRequestContext, context: 'preview' | 'frontend' ): Promise< string[] > {
	const route = `index.php?rest_route=/elementor/v1/global-classes&context=${ context }`;
	const resp = await apiRequests.customGet( request, route );
	const list: Array< { id: string; label: string } > = Array.isArray( resp?.data ) ? resp.data : [];

	return list.map( ( e ) => e.label );
}

async function expectGlobalClassesOrder(
	apiRequests: ApiRequests,
	request: APIRequestContext,
	context: 'preview' | 'frontend',
	expectedOrder: string[],
): Promise< void > {
	const labels = await getApiOrderLabels( apiRequests, request, context );
	expect( labels, `${ context } registry order` ).toEqual( expectedOrder );
}

async function waitForGlobalClassesOrder(
	apiRequests: ApiRequests,
	request: APIRequestContext,
	context: 'preview' | 'frontend',
	expectedOrder: string[],
): Promise< void > {
	await expect
		.poll( () => getApiOrderLabels( apiRequests, request, context ), {
			timeout: timeouts.longAction,
			intervals: [ 200, 500, 1000 ],
			message: `Timed out waiting for ${ context } registry order ${ JSON.stringify( expectedOrder ) }`,
		} )
		.toEqual( expectedOrder );
}

async function renameClassInClassManager( page: Page, oldLabel: string, newLabel: string ): Promise< void > {
	const item = page.locator( 'li[role="listitem"]' ).filter( { hasText: oldLabel } );

	await item.hover();
	await item.locator( '[aria-label="More actions"]' ).click();
	await page.getByRole( 'menuitem', { name: 'Rename' } ).click();

	const editable = item.locator( '[role="textbox"]' );
	await editable.waitFor( { state: 'visible', timeout: timeouts.expect } );
	await editable.click();
	await page.keyboard.press( 'ControlOrMeta+A' );
	await page.keyboard.type( newLabel );
	await page.keyboard.press( 'Enter' );

	await expect( page.locator( 'li[role="listitem"]' ).filter( { hasText: newLabel } ) ).toBeVisible( {
		timeout: timeouts.expect,
	} );
}

test.describe.serial( 'Global Classes - Cross Page Order @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let page: Page;

	let pageAId: number;
	let pageBId: number;
	let widgetAId: string;
	let widgetBId: string;
	let widgetEOnlyId: string;

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

	test( 'Both pages share one identical class order, and deleting the winning class on one page gracefully updates the other page on the frontend', async ( { apiRequests, request } ) => {
		await test.step( 'Page A: add a widget with class-a then class-b (class-b wins on top)', async () => {
			editor = await wpAdmin.openNewPage();
			pageAId = Number( await editor.getPageId() );
			widgetAId = await addDivBlockWithStyleTab( editor );

			await createAndApplyStyledClass( page, editor, CLASS_A, COLOR.a.hex );
			await createAndApplyStyledClass( page, editor, CLASS_B, COLOR.b.hex );

			await assertCanvasWidgetBackground( editor, widgetAId, COLOR.b.rgb );
			await publishAndWaitForClassesSave( editor, page );
		} );

		await test.step( 'Page B: apply the existing class-b, then create class-c (class-c wins on top)', async () => {
			editor = await wpAdmin.openNewPage();
			pageBId = Number( await editor.getPageId() );
			widgetBId = await addDivBlockWithStyleTab( editor );

			await applyExistingClass( page, editor, CLASS_B );
			await createAndApplyStyledClass( page, editor, CLASS_C, COLOR.c.hex );

			await assertCanvasWidgetBackground( editor, widgetBId, COLOR.c.rgb );
			await publishAndWaitForClassesSave( editor, page );
		} );

		await test.step( 'Preview registry order is [class-c, class-b, class-a] — same on both pages', async () => {
			const expectedOrder = [ CLASS_C, CLASS_B, CLASS_A ];

			await expectGlobalClassesOrder( apiRequests, request, 'preview', expectedOrder );
			await expectGlobalClassesOrder( apiRequests, request, 'frontend', expectedOrder );
		} );

		await test.step( 'Open Class Manager on Page A to delete class-c', async () => {
			await openExistingPageEditor( page, editor, pageAId );
			await openClassManager( page, editor, widgetAId );
		} );

		await test.step( 'Delete class-c (highest priority, unused on Page A but winning on Page B) and save', async () => {
			await deleteClassFromClassManager( page, CLASS_C );
			await saveAndCloseClassManager( page );
		} );

		await test.step( 'Page B published output is not broken and gracefully falls back to class-b', async () => {
			await waitForGlobalClassesOrder( apiRequests, request, 'frontend', [ CLASS_B, CLASS_A ] );
			await assertPublishedWidgetBackground( page, pageBId, widgetBId, COLOR.b.rgb );
		} );
	} );

	test( 'Moving a class to the lowest priority from a different page updates the affected page on the frontend', async ( { apiRequests, request } ) => {
		await test.step( 'Affected page (B): apply a new class-d that wins on top', async () => {
			await openExistingPageEditor( page, editor, pageBId );
			await editor.selectElement( widgetBId );
			await editor.v4Panel.openTab( 'style' );

			await createAndApplyStyledClass( page, editor, CLASS_D, COLOR.d.hex );

			await assertCanvasWidgetBackground( editor, widgetBId, COLOR.d.rgb );
			await publishAndWaitForClassesSave( editor, page );
		} );

		await test.step( 'Non-affected page (A): move class-d to the lowest priority and save', async () => {
			await openExistingPageEditor( page, editor, pageAId );
			await openClassManager( page, editor, widgetAId );

			// Drag class-d (currently top/highest) below class-a (currently bottom/lowest).
			await reorderClassInClassManager( page, CLASS_D, CLASS_A );
			await saveAndCloseClassManager( page );
		} );

		await test.step( 'API order is now [class-b, class-a, class-d] on both contexts', async () => {
			const expectedOrder = [ CLASS_B, CLASS_A, CLASS_D ];

			await waitForGlobalClassesOrder( apiRequests, request, 'preview', expectedOrder );
			await waitForGlobalClassesOrder( apiRequests, request, 'frontend', expectedOrder );
		} );

		await test.step( 'Affected page (B) now shows class-b after class-d dropped to the lowest priority', async () => {
			await assertPublishedWidgetBackground( page, pageBId, widgetBId, COLOR.b.rgb );
		} );
	} );

	test( 'Renaming, reordering and deleting classes on one page keeps both published pages correct', async ( { apiRequests, request } ) => {
		await test.step( 'Page B: add class-e on the stacked widget and on a second widget with only class-e', async () => {
			await openExistingPageEditor( page, editor, pageBId );
			await editor.selectElement( widgetBId );
			await editor.v4Panel.openTab( 'style' );

			await createAndApplyStyledClass( page, editor, CLASS_E, COLOR.e.hex );
			await assertCanvasWidgetBackground( editor, widgetBId, COLOR.e.rgb );

			widgetEOnlyId = await addDivBlockWithStyleTab( editor );
			await applyExistingClass( page, editor, CLASS_E );
			await assertCanvasWidgetBackground( editor, widgetEOnlyId, COLOR.e.rgb );

			await publishAndWaitForClassesSave( editor, page );
		} );

		await test.step( 'Page A: rename class-e, move it to the lowest priority, then delete class-a', async () => {
			await openExistingPageEditor( page, editor, pageAId );
			await openClassManager( page, editor, widgetAId );

			await renameClassInClassManager( page, CLASS_E, CLASS_E_RENAMED );

			// Class-e (now renamed) is at the top; drag it below class-d (the current bottom).
			await reorderClassInClassManager( page, CLASS_E_RENAMED, CLASS_D );

			await deleteClassFromClassManager( page, CLASS_A );
			await saveAndCloseClassManager( page );
		} );

		await test.step( 'API order is [class-b, class-d, cross-renamed] on both contexts after save', async () => {
			const expectedOrder = [ CLASS_B, CLASS_D, CLASS_E_RENAMED ];

			await waitForGlobalClassesOrder( apiRequests, request, 'preview', expectedOrder );
			await waitForGlobalClassesOrder( apiRequests, request, 'frontend', expectedOrder );
		} );

		await test.step( 'Page A published widget falls back to class-b after class-a deletion', async () => {
			await assertPublishedWidgetBackground( page, pageAId, widgetAId, COLOR.b.rgb );
		} );

		await test.step( 'Page B stacked widget resolves to class-b after renamed class-e moved to lowest priority', async () => {
			await assertPublishedWidgetBackground( page, pageBId, widgetBId, COLOR.b.rgb );
		} );

		await test.step( 'Page B E-only widget keeps class-e color after rename without republishing Page B', async () => {
			await assertPublishedWidgetBackground( page, pageBId, widgetEOnlyId, COLOR.e.rgb );
		} );
	} );
} );
