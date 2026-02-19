import { BrowserContext, expect, Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import EditorSelectors from '../../../../selectors/editor-selectors';
import { AtomicHelper } from '../../atomic-widgets/helper';

import { exitComponentEditMode, openComponentsTab } from './utils/navigation';
import { createContentForComponent, uniqueName, createComponent, createOverridableProp } from './utils/creation';
import { getInstancePanelPropInput, selectComponentInstance } from './utils/selection';

test.describe( 'Detach Component Instance @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;
	let page: Page;
	let helper: AtomicHelper;

	const headingControlLabel = 'Title';

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
		helper = new AtomicHelper( page, editor, wpAdminPage );

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
		editor = await wpAdminPage.openNewPage();
	} );

	test( 'should detach component instance', async () => {
		const componentName = uniqueName( 'Detach Test Component' );
		const originalTitle = 'Original Heading';
		const instanceTitle = 'Instance Heading';
		let instanceId: string;

		await test.step( 'Create a component with overridable prop', async () => {
			const { id: flexboxId } = await createContentForComponent( editor, { headingText: originalTitle } );
			instanceId = await createComponent( page, editor, componentName, flexboxId );

			await createOverridableProp( page, editor, headingControlLabel );

			await exitComponentEditMode( editor );
		} );

		await test.step( 'Create and customize an instance', async () => {
			await openComponentsTab( editor, page );

			const componentItem = page.locator( EditorSelectors.components.componentsList ).getByText( componentName );
			await componentItem.click();

			await selectComponentInstance( editor, instanceId );

			const titleInput = await getInstancePanelPropInput( page, headingControlLabel );
			await titleInput.fill( instanceTitle );
		} );

		await test.step( 'Detach the instance', async () => {
			const detachButton = page.getByRole( 'button', { name: 'Detach from Component' } );
			await expect( detachButton ).toBeVisible();
			await detachButton.click();

			const confirmButton = page.getByRole( 'button', { name: /confirm/i } );
			await expect( confirmButton ).toBeVisible();
			await confirmButton.click();
		} );

		await test.step( 'Verify instance is now a regular container', async () => {
			const frame = editor.getPreviewFrame();
			const componentInstance = frame.locator( EditorSelectors.components.instanceWidget );
			await expect( componentInstance ).not.toBeVisible();

			const container = frame.locator( '[data-element_type="e-flexbox"]' ).first();
			await expect( container ).toBeVisible();
		} );

		await test.step( 'Verify instance content is preserved', async () => {
			const frame = editor.getPreviewFrame();
			const heading = frame.locator( 'h2' ).filter( { hasText: instanceTitle } );
			await expect( heading ).toBeVisible();
		} );

		await test.step( 'Verify component changes no longer affect detached instance', async () => {
			await openComponentsTab( editor, page );

			const componentItem = page.locator( EditorSelectors.components.componentsList ).getByText( componentName );
			await componentItem.dblclick();

			await page.waitForTimeout( 1000 );

			const frame = editor.getPreviewFrame();
			const heading = frame.locator( 'h2' ).first();
			await heading.click();

			await page.waitForTimeout( 500 );

			const originalTitleInput = page.getByLabel( headingControlLabel );
			await originalTitleInput.fill( 'Modified Component Title' );

			await exitComponentEditMode( editor );

			await page.waitForTimeout( 1000 );

			const detachedHeading = frame.locator( 'h2' ).filter( { hasText: instanceTitle } );
			await expect( detachedHeading ).toBeVisible();

			const modifiedHeading = frame.locator( 'h2' ).filter( { hasText: 'Modified Component Title' } );
			await expect( modifiedHeading ).not.toBeVisible();
		} );

		await test.step( 'Verify undo restores instance', async () => {
			await editor.pressKeys( 'primary+z' );

			await page.waitForTimeout( 1000 );

			const frame = editor.getPreviewFrame();
			const componentInstance = frame.locator( EditorSelectors.components.instanceWidget );
			await expect( componentInstance ).toBeVisible();
		} );
	} );

	test( 'should preserve visual appearance after detach', async () => {
		const componentName = uniqueName( 'Visual Test Component' );
		const customColor = '#ff0000';
		let instanceId: string;

		await test.step( 'Create component with styled heading', async () => {
			const { id: flexboxId } = await createContentForComponent( editor );
			instanceId = await createComponent( page, editor, componentName, flexboxId );

			await createOverridableProp( page, editor, headingControlLabel );

			await exitComponentEditMode( editor );
		} );

		await test.step( 'Customize instance with color', async () => {
			await openComponentsTab( editor, page );

			const componentItem = page.locator( EditorSelectors.components.componentsList ).getByText( componentName );
			await componentItem.click();

			await selectComponentInstance( editor, instanceId );
		} );

		await test.step( 'Capture visual before detach', async () => {
			const frame = editor.getPreviewFrame();
			const heading = frame.locator( 'h2' ).first();
			const beforeText = await heading.textContent();
			const beforeStyles = await heading.evaluate( ( el ) => window.getComputedStyle( el ).cssText );

			await test.step( 'Detach instance', async () => {
				const detachButton = page.getByRole( 'button', { name: 'Detach from Component' } );
				await detachButton.click();

				const confirmButton = page.getByRole( 'button', { name: /confirm/i } );
				await confirmButton.click();

				await page.waitForTimeout( 1000 );
			} );

			await test.step( 'Verify visual appearance is identical', async () => {
				const headingAfter = frame.locator( 'h2' ).first();
				const afterText = await headingAfter.textContent();
				const afterStyles = await headingAfter.evaluate( ( el ) => window.getComputedStyle( el ).cssText );

				expect( afterText ).toBe( beforeText );
			} );
		} );
	} );

	test( 'should not show detach button without edit permissions', async () => {
		const componentName = uniqueName( 'Permission Test Component' );
		let instanceId: string;

		await test.step( 'Create component', async () => {
			const { id: flexboxId } = await createContentForComponent( editor );
			instanceId = await createComponent( page, editor, componentName, flexboxId );
			await exitComponentEditMode( editor );
		} );

		await test.step( 'Select instance', async () => {
			await openComponentsTab( editor, page );

			const componentItem = page.locator( EditorSelectors.components.componentsList ).getByText( componentName );
			await componentItem.click();

			await selectComponentInstance( editor, instanceId );
		} );

		await test.step( 'Verify detach button is visible with permissions', async () => {
			const detachButton = page.getByRole( 'button', { name: 'Detach from Component' } );
			await expect( detachButton ).toBeVisible();
		} );
	} );
} );
