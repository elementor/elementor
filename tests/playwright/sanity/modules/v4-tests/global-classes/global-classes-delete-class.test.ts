import { expect, type Locator, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';
import { deleteClassFromClassManager, dismissClassManagerIntro, getGlobalClasses, saveAndCloseClassManager } from './utils';

const BACKGROUND_COLOR = '#ff0000';
const BACKGROUND_COLOR_RGB = 'rgb(255, 0, 0)';

async function getComputedBackground( locator: Locator ): Promise< string > {
	return locator.evaluate( ( el ) => getComputedStyle( el ).backgroundColor );
}

async function addWidgetWithStyledGlobalClass( editor: EditorPage, className: string ): Promise< string > {
	const divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
	await editor.selectElement( divBlockId );
	await editor.v4Panel.openTab( 'style' );
	await editor.v4Panel.style.addGlobalClass( className );
	await editor.v4Panel.style.selectClassState( 'normal', className );
	await editor.v4Panel.style.openSection( 'Background' );
	await editor.v4Panel.style.setBackgroundColor( BACKGROUND_COLOR );
	return divBlockId;
}

async function openClassManagerFromStyleTab( page: Page ): Promise< void > {
	await page.getByRole( 'button', { name: 'Class Manager' } ).click();
	const saveAndContinueButton = page.getByRole( 'button', { name: 'Save & Continue' } );
	if ( await saveAndContinueButton.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
		await saveAndContinueButton.click();
	}
	await dismissClassManagerIntro( page );
}

async function assertEditingPanelRestoredAfterClose(
	page: Page,
	deletedClassName: string,
): Promise< void > {
	await expect( page.locator( '[id^="tabpanel-"][id$="-style"]' ) ).toBeVisible( { timeout: timeouts.expect } );
	await expect( page.locator( `[aria-label="Edit ${ deletedClassName }"]` ) ).toBeHidden();
}

const EXPERIMENTS = { e_atomic_elements: 'active', e_classes: 'active' } as const;

test.describe( 'Global Classes - Delete Class @v4-tests', () => {
	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'Deleting an assigned class from Class Manager should not remove the element overlay', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( EXPERIMENTS );

		const editor = await wpAdmin.openNewPage();
		const divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );

		await editor.selectElement( divBlockId );
		await editor.v4Panel.openTab( 'style' );

		const className = 'overlay-test-class';
		await editor.v4Panel.style.addGlobalClass( className );

		const divBlock = editor.getPreviewFrame().locator( `[data-id="${ divBlockId }"]` );
		await expect( divBlock ).toHaveClass( new RegExp( `\\b${ className }\\b` ) );

		await page.getByRole( 'button', { name: 'Class Manager' } ).click();
		await page.getByRole( 'button', { name: 'Save & Continue' } ).click();
		await page.locator( '[aria-label="Got it introduction"]' ).click();
		await page.locator( '[aria-label="More actions"]' ).first().click();
		await page.getByRole( 'menuitem', { name: 'Delete' } ).click();
		await page.getByRole( 'button', { name: 'Delete' } ).click();
		await page.getByRole( 'button', { name: 'Save changes' } ).click();

		const overlay = divBlock.locator( '.elementor-element-overlay' );
		await expect( overlay ).toHaveCount( 1 );
	} );

	test( 'Deleting an applied class removes its styles in the editor and on the frontend', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( EXPERIMENTS );
		const editor = await wpAdmin.openNewPage();
		const className = `delete-bg-${ Date.now() }`;

		// Arrange.
		const divBlockId = await test.step( 'Add a widget with a global class styled with a background color', async () => {
			const id = await addWidgetWithStyledGlobalClass( editor, className );
			const widget = await editor.getWidget( id );
			await expect.poll( () => getComputedBackground( widget ) ).toBe( BACKGROUND_COLOR_RGB );
			return id;
		} );

		// Act.
		await test.step( 'Open Class Manager and delete the class', async () => {
			await openClassManagerFromStyleTab( page );
			await deleteClassFromClassManager( page, className );
		} );

		// Assert — canvas reflects the deletion before save.
		await test.step( 'Background is removed from the canvas immediately after deletion', async () => {
			const widget = await editor.getWidget( divBlockId );
			await expect
				.poll( () => getComputedBackground( widget ), { timeout: timeouts.heavyAction } )
				.not.toBe( BACKGROUND_COLOR_RGB );
		} );

		// Act.
		await test.step( 'Save and close the Class Manager', async () => {
			await saveAndCloseClassManager( page );
		} );

		// Assert — editing panel is restored without errors, class chip is gone.
		await test.step( 'Editing panel is open on the styles tab, deleted class chip is absent', async () => {
			await assertEditingPanelRestoredAfterClose( page, className );
		} );

		// Assert — frontend reflects the deletion.
		await test.step( 'Publish and verify no background on the published page', async () => {
			const postId = await editor.getPageId();
			await page.goto( `/?p=${ postId }` );
			await page.waitForLoadState( 'domcontentloaded', { timeout: timeouts.longAction } );

			const publishedWidget = page.locator( `[data-id="${ divBlockId }"]` );
			await expect( publishedWidget ).toBeVisible( { timeout: timeouts.navigation } );
			await expect
				.poll( () => getComputedBackground( publishedWidget ), { timeout: timeouts.expect } )
				.not.toBe( BACKGROUND_COLOR_RGB );
		} );
	} );

	test( 'Deleting an applied class after a page reload restores the editing panel and removes styles on the frontend', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( EXPERIMENTS );
		const editor = await wpAdmin.openNewPage();
		const className = `delete-bg-reload-${ Date.now() }`;

		// Arrange.
		const divBlockId = await test.step( 'Add a widget with a global class styled with a background color', async () => {
			const id = await addWidgetWithStyledGlobalClass( editor, className );
			const widget = await editor.getWidget( id );
			await expect.poll( () => getComputedBackground( widget ) ).toBe( BACKGROUND_COLOR_RGB );
			return id;
		} );

		await test.step( 'Publish and reload the editor', async () => {
			await editor.saveAndReloadPage();
			await editor.waitForPanelToLoad();
		} );

		await test.step( 'Re-select the widget and open the style tab — background is still applied', async () => {
			await editor.selectElement( divBlockId );
			await editor.v4Panel.openTab( 'style' );
			const widget = await editor.getWidget( divBlockId );
			await expect.poll( () => getComputedBackground( widget ) ).toBe( BACKGROUND_COLOR_RGB );
		} );

		// Act.
		await test.step( 'Open Class Manager and delete the class', async () => {
			await openClassManagerFromStyleTab( page );
			await deleteClassFromClassManager( page, className );
		} );

		// Assert — canvas reflects the deletion before save.
		await test.step( 'Background is removed from the canvas immediately after deletion', async () => {
			const widget = await editor.getWidget( divBlockId );
			await expect
				.poll( () => getComputedBackground( widget ), { timeout: timeouts.heavyAction } )
				.not.toBe( BACKGROUND_COLOR_RGB );
		} );

		// Act.
		await test.step( 'Save and close the Class Manager', async () => {
			await saveAndCloseClassManager( page );
		} );

		// Assert — editing panel is restored without errors, class chip is gone.
		await test.step( 'Editing panel is open on the styles tab, deleted class chip is absent', async () => {
			await assertEditingPanelRestoredAfterClose( page, className );
		} );

		// Assert — frontend reflects the deletion.
		await test.step( 'Publish and verify no background on the published page', async () => {
			const postId = await editor.getPageId();
			await page.goto( `/?p=${ postId }` );
			await page.waitForLoadState( 'domcontentloaded', { timeout: timeouts.longAction } );

			const publishedWidget = page.locator( `[data-id="${ divBlockId }"]` );
			await expect( publishedWidget ).toBeVisible( { timeout: timeouts.navigation } );
			await expect
				.poll( () => getComputedBackground( publishedWidget ), { timeout: timeouts.expect } )
				.not.toBe( BACKGROUND_COLOR_RGB );
		} );
	} );

	test( 'Deleting a global class that is not applied to any widget after publish, detach, and editor reload persists', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( EXPERIMENTS );
		const editor = await wpAdmin.openNewPage();
		const className = `delete-unapplied-${ Date.now() }`;

		const divBlockId = await test.step( 'Add a widget with a global class styled with a background color', async () => {
			const id = await addWidgetWithStyledGlobalClass( editor, className );
			const widget = await editor.getWidget( id );
			await expect.poll( () => getComputedBackground( widget ) ).toBe( BACKGROUND_COLOR_RGB );
			return id;
		} );

		await test.step( 'Publish the page with the class applied', async () => {
			await editor.publishPage();
		} );

		await test.step( 'Remove the global class from the widget and publish again', async () => {
			await editor.selectElement( divBlockId );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.removeGlobalClass( className );
			await editor.publishPage();
		} );

		await test.step( 'Reload the editor so the class is not loaded via any widget selection', async () => {
			await page.reload();
			await editor.waitForPanelToLoad();
		} );

		await test.step( 'After reload, the global class chip is absent on the widget', async () => {
			await editor.selectElement( divBlockId );
			await editor.v4Panel.openTab( 'style' );
			await expect( page.locator( `[aria-label="Edit ${ className }"]` ) ).toBeHidden();
		} );

		await test.step( 'Open Class Manager and delete the global class', async () => {
			await openClassManagerFromStyleTab( page );
			await deleteClassFromClassManager( page, className );
		} );

		await test.step( 'Save changes is enabled after delete', async () => {
			await expect( page.getByRole( 'button', { name: 'Save changes' } ) ).toBeEnabled( {
				timeout: timeouts.heavyAction,
			} );
		} );

		await test.step( 'Save and close the Class Manager', async () => {
			await saveAndCloseClassManager( page );
		} );

		await test.step( 'The deleted class is absent from persisted global classes', async () => {
			await expect
				.poll(
					async () => {
						const { items } = await getGlobalClasses( apiRequests, page.context().request );
						return Object.values( items ).some( ( item ) => item.label === className );
					},
					{ timeout: timeouts.heavyAction },
				)
				.toBe( false );
		} );

		await test.step( 'Published page has no background from the deleted class', async () => {
			const postId = await editor.getPageId();
			await page.goto( `/?p=${ postId }` );
			await page.waitForLoadState( 'domcontentloaded', { timeout: timeouts.longAction } );

			const publishedWidget = page.locator( `[data-id="${ divBlockId }"]` );
			await expect( publishedWidget ).toBeVisible( { timeout: timeouts.navigation } );
			await expect
				.poll( () => getComputedBackground( publishedWidget ), { timeout: timeouts.expect } )
				.not.toBe( BACKGROUND_COLOR_RGB );
		} );
	} );
} );

