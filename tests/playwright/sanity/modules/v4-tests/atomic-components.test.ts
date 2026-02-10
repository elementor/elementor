import { BrowserContext, expect, Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import EditorSelectors from '../../../selectors/editor-selectors';
import { timeouts } from '../../../config/timeouts';

const OVERRIDABLE_PROP_FORM_TITLE = 'Create new property';

const uniqueName = ( baseName: string ) => `${ baseName } ${ Date.now() }`;

const getOverridablePropFormNameInput = ( page: Page ) => {
	const popover = page.locator( EditorSelectors.components.createPopup ).filter( { hasText: OVERRIDABLE_PROP_FORM_TITLE } );
	return popover.getByRole( 'textbox' ).first();
};

const dismissOnboardingDialog = async ( page: Page ) => {
	try {
		const onboardingDismiss = page.getByRole( 'button', { name: 'Got it' } );
		await onboardingDismiss.waitFor( { state: 'visible', timeout: timeouts.longAction } );
		onboardingDismiss.click();
	} catch {}
};

const exitComponentEditMode = async ( editor: EditorPage ) => {
	const backButton = editor.page.locator( EditorSelectors.components.exitEditModeButton );
	await backButton.click();
	const backdrop = editor.getPreviewFrame().getByRole( 'button', { name: 'Exit component editing mode' } );
	await expect( backdrop ).not.toBeVisible( { timeout: timeouts.longAction } );
};

const INSTANCE_PANEL_SELECTOR = '[data-type="instance-editing-panel"]';

const selectComponentInstance = async ( editor: EditorPage, index: 'first' | 'last' = 'first' ) => {
	const instanceSelector = EditorSelectors.components.instanceWidget;
	const topLevelSelector = `${ instanceSelector }:not(${ instanceSelector } ${ instanceSelector })`;
	const locator = editor.getPreviewFrame().locator( topLevelSelector );
	const instance = 'first' === index ? locator.first() : locator.last();
	await instance.waitFor( { state: 'visible', timeout: timeouts.longAction } );
	const elementId = await instance.getAttribute( 'data-id' );
	await expect( async () => {
		await editor.selectElement( elementId );
	} ).toPass( { timeout: timeouts.longAction } );
};

const getInstancePanelPropInput = async ( page: Page, propLabel: string ) => {
	const instancePanel = page.locator( INSTANCE_PANEL_SELECTOR );
	await expect( instancePanel ).toBeVisible( { timeout: timeouts.longAction } );
	await expect( instancePanel.getByText( propLabel, { exact: true } ) ).toBeVisible();
	return instancePanel.getByRole( 'textbox' ).first();
};

test.describe.serial( 'Atomic Components @v4-tests', () => {
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
			const nameInput = page.locator( EditorSelectors.components.nameInput );
			await expect( nameInput ).toBeVisible();
			await nameInput.clear();
			await nameInput.fill( componentName );

			const createButton = page.getByRole( 'button', { name: 'Create' } );
			await createButton.click();

			await dismissOnboardingDialog( page );

			const panelHeader = page.locator( EditorSelectors.components.editModeHeader );
			await expect( panelHeader ).toBeVisible( { timeout: timeouts.longAction } );

			await exitComponentEditMode( editor );
		} );

		await test.step( 'Verify component appears in Components tab', async () => {
			await editor.openElementsPanel();
			const componentsTab = page.locator( EditorSelectors.components.componentsTab );
			await componentsTab.click();

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

			const nameInput = page.locator( EditorSelectors.components.nameInput );
			await nameInput.clear();
			await nameInput.fill( componentName );
			await page.getByRole( 'button', { name: 'Create' } ).click();
			const panelHeader = page.locator( EditorSelectors.components.editModeHeader );
			await expect( panelHeader ).toBeVisible( { timeout: timeouts.longAction } );

			await dismissOnboardingDialog( page );

			await exitComponentEditMode( editor );
		} );

		await test.step( 'Edit via double-click', async () => {
			const componentInstance = editor.getPreviewFrame().locator( EditorSelectors.components.instanceWidget ).first();
			await componentInstance.dblclick( { force: true } );

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

		await test.step( 'Edit via panel button and modify heading', async () => {
			await selectComponentInstance( editor );

			const editButton = page.getByLabel( `Edit ${ componentName }` );
			await expect( editButton ).toBeVisible();
			await editButton.click();

			const panelHeader = page.locator( EditorSelectors.components.editModeHeader );
			await expect( panelHeader ).toBeVisible( { timeout: timeouts.longAction } );

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

			const nameInput = page.locator( EditorSelectors.components.nameInput );
			await nameInput.clear();
			await nameInput.fill( componentName );
			await page.getByRole( 'button', { name: 'Create' } ).click();
			const panelHeader = page.locator( EditorSelectors.components.editModeHeader );
			await expect( panelHeader ).toBeVisible( { timeout: timeouts.longAction } );

			await dismissOnboardingDialog( page );
		} );

		await test.step( 'Expose heading text prop', async () => {
			const heading = editor.getPreviewFrame().locator( EditorSelectors.v4.atomSelectors.heading.wrapper ).first();
			await heading.click();

			await editor.v4Panel.openTab( 'general' );

			const exposeIndicator = page.locator( EditorSelectors.components.overridableIndicator ).first();
			await exposeIndicator.click();

			await page.waitForSelector( EditorSelectors.components.createPopup );
			const overridableFormPopover = page.locator( EditorSelectors.components.createPopup ).filter( { hasText: OVERRIDABLE_PROP_FORM_TITLE } );
			await overridableFormPopover.waitFor( { state: 'visible' } );
			const labelInput = getOverridablePropFormNameInput( page );
			await labelInput.fill( propLabel );

			const confirmButton = page.getByRole( 'button', { name: 'Create' } );
			await confirmButton.click();
			await overridableFormPopover.waitFor( { state: 'hidden', timeout: timeouts.longAction } );
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

			await editor.openElementsPanel();
			const componentsTab = page.locator( EditorSelectors.components.componentsTab );
			await componentsTab.click();
			const componentItem = page.locator( EditorSelectors.components.componentsList ).getByText( componentName );
			await componentItem.click();

			const navigatorItem = page.locator( EditorSelectors.panels.navigator.getElementItem( outerFlexboxId ) ).first();
			await navigatorItem.click( { button: 'right' } );
			await page.waitForSelector( EditorSelectors.contextMenu.menu );
			await page.getByRole( 'menuitem', { name: 'Create component' } ).click();

			const nameInput = page.locator( EditorSelectors.components.nameInput );
			await nameInput.clear();
			await nameInput.fill( outerComponentName );
			await page.getByRole( 'button', { name: 'Create' } ).click();
			const backButton = page.locator( EditorSelectors.components.exitEditModeButton );
			await expect( backButton ).toBeVisible( { timeout: timeouts.longAction } );

			await dismissOnboardingDialog( page );
		} );

		await test.step( 'Expose inner component prop in outer component', async () => {
			const navigatorWrapper = page.locator( EditorSelectors.panels.navigator.wrapper );
			const innerComponentNavItem = navigatorWrapper.locator( '.elementor-navigator__item' ).filter( { hasText: componentName } );
			await innerComponentNavItem.click();

			const instancePanel = page.locator( INSTANCE_PANEL_SELECTOR );
			await expect( instancePanel ).toBeVisible( { timeout: timeouts.longAction } );
			await expect( instancePanel.getByText( propLabel, { exact: true } ) ).toBeVisible();

			const exposeIndicator = page.locator( EditorSelectors.components.overridableIndicator ).first();
			await exposeIndicator.click();

			await page.waitForSelector( EditorSelectors.components.createPopup );
			const overridableFormPopover = page.locator( EditorSelectors.components.createPopup ).filter( { hasText: OVERRIDABLE_PROP_FORM_TITLE } );
			await overridableFormPopover.waitFor( { state: 'visible' } );
			const labelInput = getOverridablePropFormNameInput( page );
			await labelInput.fill( propLabel );

			const confirmButton = page.getByRole( 'button', { name: 'Create' } );
			await confirmButton.click();
			await overridableFormPopover.waitFor( { state: 'hidden', timeout: timeouts.longAction } );

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

			const nameInput = page.locator( EditorSelectors.components.nameInput );
			await nameInput.clear();
			await nameInput.fill( componentName );
			await page.getByRole( 'button', { name: 'Create' } ).click();
			const panelHeader = page.locator( EditorSelectors.components.editModeHeader );
			await expect( panelHeader ).toBeVisible( { timeout: timeouts.longAction } );

			await dismissOnboardingDialog( page );
		} );

		await test.step( 'Open a new page and add component instance', async () => {
			editor = await wpAdminPage.openNewPage();

			await editor.openElementsPanel();
			const componentsTab = page.locator( EditorSelectors.components.componentsTab );
			await componentsTab.click();

			const componentItem = page.locator( EditorSelectors.components.componentsList ).getByText( componentName );
			await componentItem.click();

			const componentWidget = editor.getPreviewFrame().locator( EditorSelectors.components.instanceWidget );
			await expect( componentWidget.first() ).toBeVisible();
		} );

		await test.step( 'Publish and verify styles on frontend', async () => {
			await editor.publishAndViewPage();

			const heading = page.locator( 'h2' ).first();
			await expect( heading ).toBeVisible();

			await expect( heading ).toHaveCSS( 'background-color', backgroundColor );
		} );
	} );
} );
