import { expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';
import { deleteAllGlobalClasses } from './utils';

const BACKGROUND_COLOR = '#4a90d9';
const BACKGROUND_COLOR_RGB = 'rgb(74, 144, 217)';
const EXPERIMENTS = { e_atomic_elements: 'active', e_classes: 'active' } as const;

async function addDivBlockWithGlobalClass( editor: EditorPage, className: string ): Promise< string > {
	const divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
	await editor.selectElement( divBlockId );
	await editor.v4Panel.openTab( 'style' );
	await editor.v4Panel.style.addGlobalClass( className );
	await editor.v4Panel.style.selectClassState( 'normal', className );
	await editor.v4Panel.style.openSection( 'Background' );
	await editor.v4Panel.style.setBackgroundColor( BACKGROUND_COLOR );
	return divBlockId;
}

async function openDesignSystemClassesTab( page: Page ): Promise< void > {
	const designSystemButton = page.getByRole( 'button', { name: 'Design System', exact: true } );
	const isInToolbar = await designSystemButton.isVisible( { timeout: 2_000 } ).catch( () => false );

	if ( isInToolbar ) {
		await designSystemButton.click();
	} else {
		await page.getByRole( 'button', { name: 'More', exact: true } ).click();
		await page.getByRole( 'menuitem', { name: 'Design System', exact: true } ).click();
	}

	const saveAndContinue = page.getByRole( 'button', { name: 'Save & Continue' } );
	if ( await saveAndContinue.isVisible( { timeout: 2_000 } ).catch( () => false ) ) {
		await saveAndContinue.click();
	}

	const introDialog = page.getByRole( 'dialog' ).filter( { hasText: "Don't show this again" } );
	await introDialog.getByRole( 'button', { name: 'Got it introduction' } ).click( { timeout: 2_000, force: true } ).catch( () => {} );

	const classesTab = page.locator( '#elementor-panel' ).getByRole( 'tab', { name: 'Classes' } );
	await classesTab.click();
	await expect( classesTab ).toHaveAttribute( 'aria-selected', 'true' );
}

async function renameClassInClassManager( page: Page, currentName: string, newName: string ): Promise< void > {
	const classItem = page.locator( 'li[role="listitem"]' ).filter( { hasText: currentName } );
	await classItem.hover();
	await classItem.locator( '[aria-label="More actions"]' ).click();
	await page.getByRole( 'menuitem', { name: 'Rename' } ).click();

	const editableField = page.locator( '[contenteditable="true"][role="textbox"]' );
	await editableField.fill( newName );
	await editableField.press( 'Enter' );
}

async function saveClassManagerChanges( page: Page ): Promise< void > {
	const toast = page.locator( '#elementor-toast' );
	await toast.waitFor( { state: 'hidden', timeout: timeouts.longAction } ).catch( () => {} );

	const saveButton = page.getByRole( 'button', { name: 'Save changes' } );
	await expect( saveButton ).toBeEnabled( { timeout: timeouts.heavyAction } );
	await saveButton.click( { force: true } );
	await saveButton.waitFor( { state: 'hidden', timeout: timeouts.expect } ).catch( () => {} );
}

async function getComputedBackground( page: Page, elementId: string ): Promise< string > {
	return page.locator( `[data-id="${ elementId }"]` ).evaluate(
		( el ) => getComputedStyle( el ).backgroundColor,
	);
}

test.describe( 'Global Classes - Rename from Design System Panel @v4-tests', () => {
	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test(
		'Renaming a global class that is unused on the current page still updates the class label and preserves styles on other pages',
		async ( { page, apiRequests }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( EXPERIMENTS );

			const { request } = page.context();
			await deleteAllGlobalClasses( apiRequests, request );

			const suffix = String( Date.now() ).slice( -6 );
			const CLASS_A = `cls-a-${ suffix }`;
			const CLASS_B = `cls-b-${ suffix }`;
			const RENAMED_CLASS_A = `rnm-a-${ suffix }`;
			const RENAMED_CLASS_B = `rnm-b-${ suffix }`;

			// ── Page 1: create widget, apply two global classes, save ──────────────────

			let editor = await wpAdmin.openNewPage();
			let divBlockId = '';

			await test.step( 'Page 1 — add a widget and apply two global classes with background color', async () => {
				divBlockId = await addDivBlockWithGlobalClass( editor, CLASS_A );

				await editor.selectElement( divBlockId );
				await editor.v4Panel.openTab( 'style' );
				await editor.v4Panel.style.addGlobalClass( CLASS_B );
				await editor.v4Panel.style.selectClassState( 'normal', CLASS_B );
				await editor.v4Panel.style.openSection( 'Background' );
				await editor.v4Panel.style.setBackgroundColor( BACKGROUND_COLOR );
			} );

			const page1Id = await test.step( 'Page 1 — save (not publish) to persist the page', async () => {
				await editor.saveAndReloadPage();
				await editor.waitForPanelToLoad();
				return editor.getPageId();
			} );

			// ── Page 2: open design system, rename all classes, save via class manager ─

			await test.step( 'Page 2 — open a new page (classes are not fetched for it yet)', async () => {
				editor = await wpAdmin.openNewPage();
			} );

			await test.step( 'Page 2 — open Design System panel and switch to Classes tab', async () => {
				await openDesignSystemClassesTab( page );
			} );

			await test.step( 'Page 2 — rename CLASS_A and CLASS_B', async () => {
				await renameClassInClassManager( page, CLASS_A, RENAMED_CLASS_A );
				await renameClassInClassManager( page, CLASS_B, RENAMED_CLASS_B );
			} );

			await test.step( 'Page 2 — both renamed labels appear in the class list', async () => {
				const panel = page.locator( '#elementor-panel' );
				await expect( panel.locator( 'li[role="listitem"]' ).filter( { hasText: RENAMED_CLASS_A } ) ).toBeVisible( {
					timeout: timeouts.expect,
				} );
				await expect( panel.locator( 'li[role="listitem"]' ).filter( { hasText: RENAMED_CLASS_B } ) ).toBeVisible( {
					timeout: timeouts.expect,
				} );
			} );

			await test.step( 'Page 2 — save changes via Design System panel (publishes global classes)', async () => {
				await saveClassManagerChanges( page );
			} );

			// ── Go back to Page 1: verify styles still apply ───────────────────────────

			await test.step( 'Navigate back to Page 1 in the editor', async () => {
				await page.goto( `/wp-admin/post.php?post=${ page1Id }&action=elementor` );
				await editor.waitForPanelToLoad();
			} );

			await test.step( 'Page 1 — background color is still applied on the widget in the canvas', async () => {
				const canvasDivBlock = editor.getPreviewFrame().locator( `[data-id="${ divBlockId }"]` );
				await expect
					.poll( () => canvasDivBlock.evaluate( ( el ) => getComputedStyle( el ).backgroundColor ), {
						timeout: timeouts.heavyAction,
					} )
					.toBe( BACKGROUND_COLOR_RGB );
			} );

			await test.step( 'Page 1 — select the widget and confirm renamed class names appear in the style panel', async () => {
				await editor.selectElement( divBlockId );
				await editor.v4Panel.openTab( 'style' );

				await expect( page.locator( `[aria-label="Edit ${ RENAMED_CLASS_A }"]` ) ).toBeVisible( {
					timeout: timeouts.expect,
				} );
				await expect( page.locator( `[aria-label="Edit ${ RENAMED_CLASS_B }"]` ) ).toBeVisible( {
					timeout: timeouts.expect,
				} );
			} );

			// ── Publish Page 1 and verify on the frontend ──────────────────────────────

			await test.step( 'Page 1 — publish the page', async () => {
				await editor.publishPage();
			} );

			await test.step( 'Frontend — navigate to the published page and verify background color and class names', async () => {
				await page.goto( `/?p=${ page1Id }` );
				await page.waitForLoadState( 'domcontentloaded', { timeout: timeouts.longAction } );

				const publishedWidget = page.locator( `[data-id="${ divBlockId }"]` );
				await expect( publishedWidget ).toBeVisible( { timeout: timeouts.navigation } );

				await expect
					.poll( () => getComputedBackground( page, divBlockId ), { timeout: timeouts.expect } )
					.toBe( BACKGROUND_COLOR_RGB );

				await expect( publishedWidget ).toHaveClass( new RegExp( `\\b${ RENAMED_CLASS_A }\\b` ) );
				await expect( publishedWidget ).toHaveClass( new RegExp( `\\b${ RENAMED_CLASS_B }\\b` ) );
			} );
		},
	);
} );
