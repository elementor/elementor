import { BrowserContext, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';

const ROOT_BG = '#123456';
const ROOT_BG_RGB = 'rgb(18, 52, 86)';
const LEAF_BG = '#abcdef';
const LEAF_BG_RGB = 'rgb(171, 205, 239)';

test.describe( 'Render cascade — nested containers with interactivity @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		const page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_atomic_elements: 'active' } );
	} );

	test.afterAll( async () => {
		await wpAdmin?.resetExperiments();
		await context?.close();
	} );

	test.beforeEach( async () => {
		editor = await wpAdmin.openNewPage();
	} );

	test( 'editing root container settings does not remount deep leaf widgets', async () => {
		const rootId = await editor.addElement( { elType: 'e-flexbox' }, 'document' );
		const midId = await editor.addElement( { elType: 'e-flexbox' }, rootId );
		const innerId = await editor.addElement( { elType: 'e-flexbox' }, midId );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container: innerId } );

		const previewFrame = editor.getPreviewFrame();
		const button = previewFrame.locator( `[data-id="${ buttonId }"] .e-button-base` );
		await expect( button ).toBeVisible();

		const initialModelCid = await button.getAttribute( 'data-model-cid' );

		await editor.selectElement( rootId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );
		await editor.v4Panel.style.setBackgroundColor( ROOT_BG );

		const root = previewFrame.locator( `[data-id="${ rootId }"]` );
		await expect( root ).toHaveCSS( 'background-color', ROOT_BG_RGB, { timeout: timeouts.expect } );

		await expect( button ).toBeVisible();
		const afterModelCid = await button.getAttribute( 'data-model-cid' );
		expect( afterModelCid ).toBe( initialModelCid );
	} );

	test( 'editing leaf container settings does not re-render sibling subtree', async () => {
		const rootId = await editor.addElement( { elType: 'e-flexbox' }, 'document' );
		const siblingAId = await editor.addElement( { elType: 'e-flexbox' }, rootId );
		const siblingBId = await editor.addElement( { elType: 'e-flexbox' }, rootId );
		const buttonInBId = await editor.addWidget( { widgetType: 'e-button', container: siblingBId } );

		const previewFrame = editor.getPreviewFrame();
		const buttonInB = previewFrame.locator( `[data-id="${ buttonInBId }"] .e-button-base` );
		await expect( buttonInB ).toBeVisible();

		const beforeCid = await buttonInB.getAttribute( 'data-model-cid' );

		await editor.selectElement( siblingAId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );
		await editor.v4Panel.style.setBackgroundColor( LEAF_BG );

		const siblingA = previewFrame.locator( `[data-id="${ siblingAId }"]` );
		await expect( siblingA ).toHaveCSS( 'background-color', LEAF_BG_RGB, { timeout: timeouts.expect } );

		const afterCid = await buttonInB.getAttribute( 'data-model-cid' );
		expect( afterCid ).toBe( beforeCid );
	} );
} );
