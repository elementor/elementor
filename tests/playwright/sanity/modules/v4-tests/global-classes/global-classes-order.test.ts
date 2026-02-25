import type EditorPage from '../../../../pages/editor-page';
import { expect, Locator, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { deleteAllGlobalClasses, openClassManager, reorderClassInClassManager, saveAndCloseClassManager } from './utils';
import { timeouts } from '../../../../config/timeouts';

async function createClassWithBackgroundColor(
	page: Page,
	editor: EditorPage,
	className: string,
	backgroundColor: string,
): Promise<void> {
	await editor.v4Panel.style.addGlobalClass( className );
	await page.waitForTimeout( 500 );

	await editor.v4Panel.style.selectClassState( 'normal', className );

	await editor.v4Panel.style.openSection( 'Background' );
	await editor.v4Panel.style.setBackgroundColor( backgroundColor );
}

function getCanvasDivBlock( editor: EditorPage, divBlockId: string ): Locator {
	return editor.getPreviewFrame().locator( `[data-id="${ divBlockId }"]` );
}

function getFrontendDivBlock( page: Page, divBlockId: string ): Locator {
	return page.locator( `[data-id="${ divBlockId }"]` );
}

async function goBackToEditor( page: Page, editor: EditorPage ): Promise<void> {
	await page.goBack();
	await editor.waitForPanelToLoad();
	await page.waitForTimeout( timeouts.navigation );
}

async function viewPublishedPage( page: Page, editor: EditorPage ): Promise<void> {
	await editor.viewPage();
	await page.waitForTimeout( timeouts.navigation );
}

async function assertDivBlockColor( divBlock: Locator, expectedColor: string ): Promise<void> {
	await expect( divBlock ).toBeVisible();
	await expect( divBlock ).toHaveCSS( 'background-color', expectedColor );
}

async function assertDivBlockHasClasses( divBlock: Locator, classNames: string[] ): Promise<void> {
	for ( const className of classNames ) {
		await expect( divBlock ).toHaveClass( new RegExp( className ) );
	}
}

test.describe( 'Global Classes - Order @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let page: Page;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		page = await browser.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_atomic_elements: 'active', e_classes: 'active' } );
	} );

	test.beforeEach( async ( { apiRequests } ) => {
		const { request } = page.context();
		editor = await wpAdmin.openNewPage();
		await deleteAllGlobalClasses( apiRequests, request );
	} );

	test.afterAll( async ( { apiRequests } ) => {
		const { request } = page.context();
		await deleteAllGlobalClasses( apiRequests, request );

		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Global class order determines CSS specificity on canvas and frontend', async () => {
		let divBlockId: string;
		let canvasDivBlock: Locator;
		let frontendDivBlock: Locator;

		const RED = 'rgb(255, 0, 0)';
		const BLUE = 'rgb(0, 0, 255)';
		const GREEN = 'rgb(0, 255, 0)';
		const ALL_CLASSES = [ 'red-bg', 'blue-bg', 'green-bg' ];

		await test.step( 'Setup: Add div block and open style tab', async () => {
			divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
			await editor.selectElement( divBlockId );
			await editor.v4Panel.openTab( 'style' );
		} );

		await test.step( 'Create red-bg class and verify canvas shows red', async () => {
			await createClassWithBackgroundColor( page, editor, 'red-bg', '#FF0000' );
			canvasDivBlock = getCanvasDivBlock( editor, divBlockId );
			await assertDivBlockColor( canvasDivBlock, RED );
		} );

		await test.step( 'Create blue-bg class and verify canvas shows blue', async () => {
			await createClassWithBackgroundColor( page, editor, 'blue-bg', '#0000FF' );
			canvasDivBlock = getCanvasDivBlock( editor, divBlockId );
			await assertDivBlockColor( canvasDivBlock, BLUE );
		} );

		await test.step( 'Create green-bg class and verify canvas shows green (last class wins)', async () => {
			await createClassWithBackgroundColor( page, editor, 'green-bg', '#00FF00' );
			await page.waitForTimeout( timeouts.action );
			canvasDivBlock = getCanvasDivBlock( editor, divBlockId );
			await assertDivBlockColor( canvasDivBlock, GREEN );
		} );

		await test.step( 'Publish and view frontend: Verify all classes present and green wins', async () => {
			await editor.publishPage();
			await viewPublishedPage( page, editor );

			frontendDivBlock = getFrontendDivBlock( page, divBlockId );
			await assertDivBlockColor( frontendDivBlock, GREEN );
			await assertDivBlockHasClasses( frontendDivBlock, ALL_CLASSES );
		} );

		await test.step( 'Go back to editor and verify canvas shows green', async () => {
			await goBackToEditor( page, editor );
			canvasDivBlock = getCanvasDivBlock( editor, divBlockId );
			await assertDivBlockColor( canvasDivBlock, GREEN );
		} );

		await test.step( 'Reorder: Move red-bg to last position (drag below green-bg)', async () => {
			await openClassManager( page, editor, divBlockId );
			await reorderClassInClassManager( page, 'red-bg', 'green-bg' );
			await saveAndCloseClassManager( page );
		} );

		await test.step( 'Verify canvas shows red after first reorder', async () => {
			canvasDivBlock = getCanvasDivBlock( editor, divBlockId );
			await assertDivBlockColor( canvasDivBlock, RED );
		} );

		await test.step( 'View frontend: Verify red wins after first reorder (global class order auto-saved)', async () => {
			await viewPublishedPage( page, editor );

			frontendDivBlock = getFrontendDivBlock( page, divBlockId );
			await assertDivBlockColor( frontendDivBlock, RED );
			await assertDivBlockHasClasses( frontendDivBlock, ALL_CLASSES );
		} );

		await test.step( 'Go back to editor and verify canvas still shows red', async () => {
			await goBackToEditor( page, editor );
			canvasDivBlock = getCanvasDivBlock( editor, divBlockId );
			await assertDivBlockColor( canvasDivBlock, RED );
		} );

		await test.step( 'Reorder: Move blue-bg to last position (drag below red-bg)', async () => {
			await openClassManager( page, editor, divBlockId );
			await reorderClassInClassManager( page, 'blue-bg', 'red-bg' );
			await saveAndCloseClassManager( page );
		} );

		await test.step( 'Verify canvas shows blue after second reorder', async () => {
			canvasDivBlock = getCanvasDivBlock( editor, divBlockId );
			await assertDivBlockColor( canvasDivBlock, BLUE );
		} );

		await test.step( 'View frontend: Verify blue wins after second reorder', async () => {
			await viewPublishedPage( page, editor );

			frontendDivBlock = getFrontendDivBlock( page, divBlockId );
			await assertDivBlockColor( frontendDivBlock, BLUE );
			await assertDivBlockHasClasses( frontendDivBlock, ALL_CLASSES.reverse() );
		} );

		await test.step( 'Go back to editor and verify canvas still shows blue', async () => {
			await goBackToEditor( page, editor );
			canvasDivBlock = getCanvasDivBlock( editor, divBlockId );
			await assertDivBlockColor( canvasDivBlock, BLUE );
		} );
	} );
} );
