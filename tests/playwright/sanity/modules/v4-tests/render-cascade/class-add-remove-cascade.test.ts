import { BrowserContext, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';

const PARENT_CLASS = 'render-cascade-parent';
const LEAF_CLASS = 'render-cascade-leaf';

test.describe( 'Render cascade — global class add/remove @v4-tests', () => {
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

	test( 'adding a class on a parent container keeps children rendered', async () => {
		const parentId = await editor.addElement( { elType: 'e-flexbox' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: parentId } );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container: parentId } );

		await editor.selectElement( parentId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.addGlobalClass( PARENT_CLASS );

		const previewFrame = editor.getPreviewFrame();
		const parent = previewFrame.locator( `[data-id="${ parentId }"]` );
		await expect( parent ).toHaveClass( new RegExp( PARENT_CLASS ), { timeout: timeouts.expect } );

		await expect( previewFrame.locator( `[data-id="${ headingId }"] .e-heading-base` ) ).toBeVisible();
		await expect( previewFrame.locator( `[data-id="${ buttonId }"] .e-button-base` ) ).toBeVisible();
	} );

	test( 'removing a class on a parent container keeps children rendered', async () => {
		const parentId = await editor.addElement( { elType: 'e-flexbox' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: parentId } );

		await editor.selectElement( parentId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.addGlobalClass( PARENT_CLASS );

		const previewFrame = editor.getPreviewFrame();
		const parent = previewFrame.locator( `[data-id="${ parentId }"]` );
		await expect( parent ).toHaveClass( new RegExp( PARENT_CLASS ), { timeout: timeouts.expect } );

		await editor.v4Panel.style.removeGlobalClass( PARENT_CLASS );
		await expect( parent ).not.toHaveClass( new RegExp( PARENT_CLASS ), { timeout: timeouts.expect } );

		await expect( previewFrame.locator( `[data-id="${ headingId }"] .e-heading-base` ) ).toBeVisible();
	} );

	test( 'add and remove class on a leaf widget does not disturb siblings', async () => {
		const parentId = await editor.addElement( { elType: 'container' }, 'document' );
		const leafId = await editor.addWidget( { widgetType: 'e-heading', container: parentId } );
		const siblingId = await editor.addWidget( { widgetType: 'e-heading', container: parentId } );

		const previewFrame = editor.getPreviewFrame();
		const sibling = previewFrame.locator( `[data-id="${ siblingId }"] .e-heading-base` );
		const beforeCid = await sibling.getAttribute( 'data-model-cid' );

		await editor.selectElement( leafId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.addGlobalClass( LEAF_CLASS );

		const leaf = previewFrame.locator( `[data-id="${ leafId }"] .e-heading-base` );
		await expect( leaf ).toHaveClass( new RegExp( LEAF_CLASS ), { timeout: timeouts.expect } );

		await editor.v4Panel.style.removeGlobalClass( LEAF_CLASS );
		await expect( leaf ).not.toHaveClass( new RegExp( LEAF_CLASS ), { timeout: timeouts.expect } );

		const afterCid = await sibling.getAttribute( 'data-model-cid' );
		expect( afterCid ).toBe( beforeCid );
	} );
} );
