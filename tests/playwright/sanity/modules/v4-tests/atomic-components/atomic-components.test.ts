import { BrowserContext, expect, Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import EditorSelectors from '../../../../selectors/editor-selectors';
import { timeouts } from '../../../../config/timeouts';

import { exitComponentEditMode, openComponentsTab } from './utils/navigation';
import { createComponent, createOverridableProp, uniqueName } from './utils/creation';
import { getInstancePanelPropInput, selectComponentInstance } from './utils/selection';

test.describe( 'Atomic Components @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;
	let page: Page;

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

	test( 'should allow converting an atomic container into a component', async () => {
		editor = await wpAdminPage.openNewPage();
		const componentName = uniqueName( 'Test Component' );
		let flexboxId: string;

		await test.step( 'Create a flexbox container with a heading widget', async () => {
			flexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, 'document' );
			await editor.addWidget( { widgetType: EditorSelectors.v4.atoms.heading, container: flexboxId } );
		} );

		await test.step( 'Right-click on flexbox and create component', async () => {
			const flexbox = editor.getPreviewFrame().locator( `[data-id="${ flexboxId }"]` );
			await flexbox.click( { button: 'right' } );

			await page.waitForSelector( EditorSelectors.contextMenu.menu );
			const createComponentMenuItem = page.getByRole( 'menuitem', { name: 'Create component' } );
			await expect( createComponentMenuItem ).toBeVisible();
			await createComponentMenuItem.click();
		} );

		await test.step( 'Fill component name and create', async () => {
			await createComponent( page, componentName );

			await exitComponentEditMode( editor );
		} );

		await test.step( 'Verify component appears in Components tab', async () => {
			await openComponentsTab( editor, page );

			const componentItem = page.locator( EditorSelectors.components.componentsList ).getByText( componentName );
			await expect( componentItem ).toBeVisible();
		} );

		await test.step( 'Verify component can be dropped on canvas', async () => {
			const componentItem = page.locator( EditorSelectors.components.componentsList ).getByText( componentName );
			await componentItem.click();

			const componentWidget = editor.getPreviewFrame().locator( EditorSelectors.components.instanceWidget );
			await expect( componentWidget.first() ).toBeVisible();
		} );

		await test.step( 'Verify component renders on frontend', async () => {
			await editor.publishAndViewPage();

			const heading = page.locator( 'h2' ).first();
			await expect( heading ).toBeVisible();
		} );
	} );

	test( 'should allow editing a component instance', async () => {
		editor = await wpAdminPage.openNewPage();
		const componentName = uniqueName( 'Editable Component' );
		const editedHeadingText = 'Edited Heading Text';

		await test.step( 'Create a component', async () => {
			const flexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, 'document' );
			await editor.addWidget( { widgetType: EditorSelectors.v4.atoms.heading, container: flexboxId } );

			const flexbox = editor.getPreviewFrame().locator( `[data-id="${ flexboxId }"]` );
			await flexbox.click( { button: 'right' } );
			await page.waitForSelector( EditorSelectors.contextMenu.menu );
			await page.getByRole( 'menuitem', { name: 'Create component' } ).click();

			await createComponent( page, componentName );

			await exitComponentEditMode( editor );
		} );

		await test.step( 'Edit via double-click', async () => {
			const componentInstance = editor.getPreviewFrame().locator( EditorSelectors.components.instanceWidget ).first();
			await componentInstance.dblclick();

			const panelHeader = page.locator( EditorSelectors.components.editModeHeader );
			await expect( panelHeader ).toBeVisible( { timeout: timeouts.longAction } );
			await expect( panelHeader ).toContainText( componentName );

			await exitComponentEditMode( editor );
		} );

		await test.step( 'Edit via context menu', async () => {
			const componentInstance = editor.getPreviewFrame().locator( EditorSelectors.components.instanceWidget ).first();
			await componentInstance.click( { button: 'right', force: true } );
			await page.waitForSelector( EditorSelectors.contextMenu.menu );

			const editMenuItem = page.getByRole( 'menuitem', { name: 'Edit Component' } );
			await expect( editMenuItem ).toBeVisible();
			await editMenuItem.click();

			const panelHeader = page.locator( EditorSelectors.components.editModeHeader );
			await expect( panelHeader ).toBeVisible( { timeout: timeouts.longAction } );

			await exitComponentEditMode( editor );
		} );

		await test.step( 'Edit via panel edit button', async () => {
			await selectComponentInstance( editor );

			const editButton = page.getByLabel( `Edit ${ componentName }` );
			await expect( editButton ).toBeVisible();
			await editButton.click();

			const panelHeader = page.locator( EditorSelectors.components.editModeHeader );
			await expect( panelHeader ).toBeVisible( { timeout: timeouts.longAction } );
		} );

		await test.step( 'Modify heading', async () => {
			const heading = editor.getPreviewFrame().locator( EditorSelectors.v4.atomSelectors.heading.wrapper ).first();
			await heading.click();
			await editor.v4Panel.openTab( 'general' );

			const titleInput = page.getByRole( 'tabpanel', { name: 'General' } ).getByRole( 'textbox' ).first();
			await titleInput.clear();
			await titleInput.fill( editedHeadingText );

			await exitComponentEditMode( editor );
		} );

		await test.step( 'Verify component renders correctly on frontend after edits', async () => {
			await editor.publishAndViewPage();

			const heading = page.locator( 'h2' ).first();
			await expect( heading ).toBeVisible();
			await expect( heading ).toHaveText( editedHeadingText );
		} );
	} );

	test( 'should allow exposing props and overriding at instance and nested component level', async () => {
		editor = await wpAdminPage.openNewPage();
		const componentName = uniqueName( 'Props Component' );
		const outerComponentName = uniqueName( 'Outer Component' );
		const propLabel = 'Heading Text';
		const overrideValue = 'Overridden Heading';
		const nestedOverrideValue = 'Nested Override';

		await test.step( 'Create a component with heading', async () => {
			const flexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, 'document' );
			await editor.addWidget( { widgetType: EditorSelectors.v4.atoms.heading, container: flexboxId } );

			const flexbox = editor.getPreviewFrame().locator( `[data-id="${ flexboxId }"]` );
			await flexbox.click( { button: 'right' } );
			await page.waitForSelector( EditorSelectors.contextMenu.menu );
			await page.getByRole( 'menuitem', { name: 'Create component' } ).click();

			await createComponent( page, componentName );
		} );

		await test.step( 'Expose heading text prop', async () => {
			const heading = editor.getPreviewFrame().locator( EditorSelectors.v4.atomSelectors.heading.wrapper ).first();
			await heading.click();

			await editor.v4Panel.openTab( 'general' );

			await createOverridableProp( page, propLabel );
		} );

		await test.step( 'Exit edit mode and select component instance', async () => {
			await exitComponentEditMode( editor );

			await selectComponentInstance( editor );
		} );

		await test.step( 'Verify exposed prop appears in instance panel and override it', async () => {
			const propControl = await getInstancePanelPropInput( page, propLabel );

			await propControl.clear();
			await propControl.fill( overrideValue );

			const headingText = editor.getPreviewFrame().locator( EditorSelectors.v4.atomSelectors.heading.wrapper ).first();
			await expect( headingText ).toContainText( overrideValue );
		} );

		await test.step( 'Create outer component wrapping inner component instance', async () => {
			const outerFlexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, 'document' );

			await openComponentsTab( editor, page );

			const componentItem = page.locator( EditorSelectors.components.componentsList ).getByText( componentName );
			await componentItem.click();

			const navigatorItem = page.locator( EditorSelectors.panels.navigator.getElementItem( outerFlexboxId ) ).first();
			await navigatorItem.click( { button: 'right' } );
			await page.waitForSelector( EditorSelectors.contextMenu.menu );
			await page.getByRole( 'menuitem', { name: 'Create component' } ).click();

			await createComponent( page, outerComponentName );

			const backButton = page.locator( EditorSelectors.components.exitEditModeButton );
			await expect( backButton ).toBeVisible( { timeout: timeouts.longAction } );
		} );

		await test.step( 'Expose inner component prop in outer component', async () => {
			const navigatorWrapper = page.locator( EditorSelectors.panels.navigator.wrapper );
			const innerComponentNavItem = navigatorWrapper.locator( '.elementor-navigator__item' ).filter( { hasText: componentName } );
			await innerComponentNavItem.click();

			await createOverridableProp( page, propLabel );

			const autosavePromise = page.waitForResponse(
				( response ) => response.url().includes( '/wp-admin/admin-ajax.php' ) && 200 === response.status(),
			);
			await exitComponentEditMode( editor );
			await autosavePromise;
		} );

		await test.step( 'Override nested prop on outer component instance', async () => {
			await selectComponentInstance( editor, 'last' );

			const propControl = await getInstancePanelPropInput( page, propLabel );
			await propControl.clear();
			await propControl.fill( nestedOverrideValue );

			const headingText = editor.getPreviewFrame().locator( EditorSelectors.v4.atomSelectors.heading.wrapper ).last();
			await expect( headingText ).toContainText( nestedOverrideValue );
		} );

		await test.step( 'Verify overrides persist on frontend', async () => {
			await editor.publishAndViewPage();

			const firstHeading = page.locator( 'h2' ).first();
			await expect( firstHeading ).toBeVisible();
			await expect( firstHeading ).toContainText( overrideValue );

			const lastHeading = page.locator( 'h2' ).nth( 1 );
			await expect( lastHeading ).toContainText( nestedOverrideValue, { timeout: timeouts.longAction } );
		} );
	} );

	test( 'should load local styles used within a component on page', async () => {
		editor = await wpAdminPage.openNewPage();
		const componentName = uniqueName( 'Styled Component' );
		const backgroundColor = 'rgb(255, 0, 0)';

		await test.step( 'Create a component with styled heading', async () => {
			const flexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, 'document' );
			await editor.addWidget( { widgetType: EditorSelectors.v4.atoms.heading, container: flexboxId } );

			const heading = editor.getPreviewFrame().locator( EditorSelectors.v4.atomSelectors.heading.wrapper ).first();
			await heading.click();

			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( '#ff0000' );
			await editor.v4Panel.style.closeSection( 'Background' );

			const flexbox = editor.getPreviewFrame().locator( `[data-id="${ flexboxId }"]` );
			await flexbox.click( { button: 'right' } );
			await page.waitForSelector( EditorSelectors.contextMenu.menu );
			await page.getByRole( 'menuitem', { name: 'Create component' } ).click();

			await createComponent( page, componentName );
		} );

		await test.step( 'Open a new page and add component instance', async () => {
			editor = await wpAdminPage.openNewPage();

			await openComponentsTab( editor, page );

			const componentItem = page.locator( EditorSelectors.components.componentsList ).getByText( componentName );
			await componentItem.click();

			const componentWidget = editor.getPreviewFrame().locator( EditorSelectors.components.instanceWidget );
			await expect( componentWidget.first() ).toBeVisible();
		} );

		await test.step( 'Verify styles are applied in editor canvas', async () => {
			const heading = editor.getPreviewFrame().locator( 'h2' ).first();
			await expect( heading ).toBeVisible();
			await expect( heading ).toHaveCSS( 'background-color', backgroundColor );
		} );

		await test.step( 'Publish and verify styles on frontend', async () => {
			await editor.publishAndViewPage();

			const heading = page.locator( 'h2' ).first();
			await expect( heading ).toBeVisible();
			await expect( heading ).toHaveCSS( 'background-color', backgroundColor );
		} );
	} );
} );
