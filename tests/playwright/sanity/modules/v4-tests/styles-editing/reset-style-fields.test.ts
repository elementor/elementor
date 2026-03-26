import { BrowserContext, expect, type Locator } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';
import { deleteAllGlobalClasses } from '../global-classes/utils';
import type ApiRequests from '../../../../assets/api-requests';

const HEADING_INNER_SELECTOR = '.e-heading-base';
const LOCAL_TEXT_COLOR = '#ff0000';
const LOCAL_DIV_BACKGROUND_COLOR = '#00ff00';
const GLOBAL_BACKGROUND_COLOR = '#0000ff';
const EXPECTED_EDITED_TEXT_COLOR = 'rgb(255, 0, 0)';
const EXPECTED_LOCAL_DIV_BACKGROUND = 'rgb(0, 255, 0)';
const EXPECTED_EDITED_GLOBAL_BACKGROUND = 'rgb(0, 0, 255)';

type ComputedStyles = { backgroundColor: string; color: string };

async function readComputedStyles( locator: Locator ): Promise<ComputedStyles> {
	return locator.evaluate( ( el ) => {
		const cs = getComputedStyle( el );
		return { backgroundColor: cs.backgroundColor, color: cs.color };
	}, { timeout: timeouts.heavyAction } );
}

async function viewPublishedPage( editor: EditorPage, postId: string ): Promise<void> {
	await editor.publishPage();
	await editor.page.goto( `/?p=${ postId }` );
	await editor.page.waitForLoadState( 'domcontentloaded', { timeout: timeouts.longAction } );
}

test.describe( 'Reset style fields @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		const page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_atomic_elements: 'active', e_classes: 'active' } );
	} );

	test.afterAll( async () => {
		await wpAdmin?.resetExperiments();
		await context?.close();
	} );

	test.beforeEach( async ( { apiRequests } ) => {
		editor = await wpAdmin.openNewPage();
		await deleteAllGlobalClasses( apiRequests as ApiRequests, context.request );
	} );

	test( 'Resetting style fields is reflected immediately in the canvas, and in the frontend upon publish', async () => {
		const globalClassName = `gc-bg-clear-${ Date.now() }`;

		const divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: divBlockId } );

		const divBlockWidget = await editor.getWidget( divBlockId );
		const headingWidget = await editor.getWidget( headingId );
		const headingInner = headingWidget.locator( HEADING_INNER_SELECTOR );

		await test.step( 'Capture baselines before any custom styles', async () => {
			await editor.selectElement( headingId );
			await editor.v4Panel.openTab( 'style' );

			await expect( headingInner ).toBeVisible( { timeout: timeouts.expect } );
		} );

		const baselineHeadingStyles = await readComputedStyles( headingInner );
		const baselineHeadingTextColor = baselineHeadingStyles.color;
		const baselineDivStyles = await readComputedStyles( divBlockWidget );
		const baselineDivBlockBackground = baselineDivStyles.backgroundColor;

		await test.step( 'Set local text color on the heading', async () => {
			await editor.v4Panel.style.selectClassState( 'normal', 'local' );
			await editor.v4Panel.style.openSection( 'Typography' );
			await editor.v4Panel.style.setFontColor( LOCAL_TEXT_COLOR );
			const headingStyles = await readComputedStyles( headingInner );
			expect( headingStyles.color ).toBe( EXPECTED_EDITED_TEXT_COLOR );
		} );

		await test.step( 'Add a global class on the div block and set its background (global styles, not widget base)', async () => {
			await editor.selectElement( divBlockId );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.addGlobalClass( globalClassName );
			await editor.page.waitForTimeout( 500 );
			await editor.v4Panel.style.selectClassState( 'normal', globalClassName );
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( GLOBAL_BACKGROUND_COLOR );
			const divStyles = await readComputedStyles( divBlockWidget );
			expect( divStyles.backgroundColor ).toBe( EXPECTED_EDITED_GLOBAL_BACKGROUND );
		} );

		await test.step( 'Set local background color on the div block (local wins over global on the canvas)', async () => {
			await editor.v4Panel.style.selectClassState( 'normal', 'local' );
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( LOCAL_DIV_BACKGROUND_COLOR );
			const divStyles = await readComputedStyles( divBlockWidget );
			expect( divStyles.backgroundColor ).toBe( EXPECTED_LOCAL_DIV_BACKGROUND );
		} );

		const postId = await editor.getPageId();

		await test.step( 'Save and fully reload the editor', async () => {
			await editor.saveAndReloadPage();
			await editor.waitForPanelToLoad();
		} );

		await test.step( 'After reload, canvas still shows the saved heading color and div block local background', async () => {
			const headingCanvas = ( await editor.getWidget( headingId ) ).locator( HEADING_INNER_SELECTOR );
			const divBlockCanvas = await editor.getWidget( divBlockId );

			const headingStyles = await readComputedStyles( headingCanvas );
			const divStyles = await readComputedStyles( divBlockCanvas );
			expect( headingStyles.color ).toBe( EXPECTED_EDITED_TEXT_COLOR );
			expect( divStyles.backgroundColor ).toBe( EXPECTED_LOCAL_DIV_BACKGROUND );
		} );

		await test.step( 'Clear heading local text color and div block local background (same editor session, no reload)', async () => {
			await editor.selectElement( headingId );
			await editor.v4Panel.openTab( 'style' );

			const headingInnerCanvas = ( await editor.getWidget( headingId ) ).locator( HEADING_INNER_SELECTOR );

			await editor.v4Panel.style.selectClassState( 'normal', 'local' );
			await editor.v4Panel.style.openSection( 'Typography' );
			await editor.v4Panel.style.clearFontColor();
			await expect( headingInnerCanvas ).toBeVisible( { timeout: timeouts.expect } );

			const headingComputedStyles = await readComputedStyles( headingInnerCanvas );
			expect( headingComputedStyles ).toMatchObject( { color: baselineHeadingTextColor } );

			await editor.selectElement( divBlockId );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.selectClassState( 'normal', 'local' );
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.clearBackgroundColor();
			await editor.page.waitForTimeout( timeouts.short );

			const divBlockComputedStyles = await readComputedStyles( await editor.getWidget( divBlockId ) );
			expect( divBlockComputedStyles ).toMatchObject( { backgroundColor: EXPECTED_EDITED_GLOBAL_BACKGROUND } );
		} );

		await test.step( 'Save and reload after clearing local styles', async () => {
			await editor.saveAndReloadPage();
			await editor.waitForPanelToLoad();
		} );

		await test.step( 'After second reload, heading baseline and global background persist on canvas', async () => {
			await expect( async () => {
				const headingStyles = await readComputedStyles(
					( await editor.getWidget( headingId ) ).locator( HEADING_INNER_SELECTOR ),
				);
				const divStyles = await readComputedStyles( await editor.getWidget( divBlockId ) );
				expect( headingStyles ).toMatchObject( { color: baselineHeadingTextColor } );
				expect( divStyles ).toMatchObject( { backgroundColor: EXPECTED_EDITED_GLOBAL_BACKGROUND } );
			} ).toPass( { timeout: timeouts.heavyAction } );
		} );

		await test.step( 'Clear global class background — canvas matches baseline', async () => {
			await editor.selectElement( divBlockId );
			await editor.v4Panel.openTab( 'style' );

			await editor.v4Panel.style.selectClassState( 'normal', globalClassName );
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.clearBackgroundColor();

			const computedStyles = await readComputedStyles( await editor.getWidget( divBlockId ) );
			expect( computedStyles ).toMatchObject( { backgroundColor: baselineDivBlockBackground } );
		} );

		await test.step( 'Publish and verify heading and div block on the frontend', async () => {
			await viewPublishedPage( editor, postId );

			const publishedHeading = editor.page.locator( HEADING_INNER_SELECTOR ).first();
			const publishedDivBlock = editor.page.locator( `[data-id="${ divBlockId }"]` );

			await expect( publishedHeading ).toBeVisible( { timeout: timeouts.navigation } );
			await expect( publishedDivBlock ).toBeVisible( { timeout: timeouts.navigation } );

			const publishedHeadingStyles = await readComputedStyles( publishedHeading );
			const publishedDivStyles = await readComputedStyles( publishedDivBlock );
			expect( publishedHeadingStyles.color ).toBe( baselineHeadingTextColor );
			expect( publishedDivStyles.backgroundColor ).toBe( baselineDivBlockBackground );
		} );
	} );
} );
