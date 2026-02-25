import { BrowserContext, expect, Locator, Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import EditorSelectors from '../../../../selectors/editor-selectors';
import { timeouts } from '../../../../config/timeouts';

import { exitComponentEditMode, openComponentsTab, openCreateComponentFromContextMenu } from './utils/navigation';
import { createOverridableProp, createContentForComponent, uniqueName, createComponent } from './utils/creation';
import { getInstancePanelPropInput, getNavigationItem, selectComponentInstance } from './utils/selection';
import { AtomicHelper } from '../../atomic-widgets/helper';

test.describe( 'Atomic Components @v4-tests', () => {
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

	test( 'should allow converting an atomic container into a component', async () => {
		const componentName = uniqueName( 'Test Component' );
		let flexbox: Locator;

		await test.step( 'Create a flexbox container with a heading widget', async () => {
			const { locator } = await createContentForComponent( editor );
			flexbox = locator;
		} );

		await test.step( 'Right-click on flexbox and create component', async () => {
			await openCreateComponentFromContextMenu( flexbox, page );
		} );

		await test.step( 'Fill component name and create', async () => {
			await createComponent( page, editor, componentName );

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
		const componentName = uniqueName( 'Editable Component' );
		const editedHeadingText = 'Edited Heading Text';
		let flexboxId: string;
		let instanceId: string;

		await test.step( 'Create a component from navigation panel', async () => {
			const { id } = await createContentForComponent( editor );
			flexboxId = id;

			const navigatorItem = await getNavigationItem( page, flexboxId );

			await openCreateComponentFromContextMenu( navigatorItem, page );
			instanceId = await createComponent( page, editor, componentName );

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
			await selectComponentInstance( editor, instanceId );

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

			const titleInput = helper.getSettingsField( headingControlLabel ).getByRole( 'textbox' ).first();
			await titleInput.clear();
			await titleInput.fill( editedHeadingText );

			await exitComponentEditMode( editor );
		} );

		await test.step( 'Verify component renders correctly on canvas after exit edit mode', async () => {
			const heading = editor.getPreviewFrame().locator( EditorSelectors.v4.atomSelectors.heading.wrapper ).first();
			await expect( heading ).toBeVisible();
			await expect( heading ).toHaveText( editedHeadingText );
		} );

		await test.step( 'Verify component renders correctly on frontend after edits', async () => {
			await editor.publishAndViewPage();

			const heading = page.locator( 'h2' ).first();
			await expect( heading ).toBeVisible();
			await expect( heading ).toHaveText( editedHeadingText );
		} );
	} );

	test( 'should allow exposing props and overriding at instance and nested component level', async ( {}, testInfo ) => {
		const componentName = uniqueName( 'Props Component' );
		const outerComponentName = uniqueName( 'Outer Component' );

		const propLabel = 'Heading Text';
		const nestedDefaultValue = 'Nested Default';
		const overrideValue = 'Overridden Heading';
		const nestedOverrideValue = 'Nested Override';

		let instanceId: string;
		let outerFlexboxId: string;
		let outerInstanceId: string;
		let originalHeadingValue: string;

		await test.step( 'Create a component with heading', async () => {
			const { locator: flexbox } = await createContentForComponent( editor );

			await openCreateComponentFromContextMenu( flexbox, page );
			instanceId = await createComponent( page, editor, componentName );
		} );

		await test.step( 'Expose heading text prop', async () => {
			const heading = editor.getPreviewFrame().locator( EditorSelectors.v4.atomSelectors.heading.wrapper ).first();
			originalHeadingValue = await heading.textContent();
			await heading.click();

			await editor.v4Panel.openTab( 'general' );

			await createOverridableProp( page, propLabel );
		} );

		await test.step( 'Verify original value is displayed in instance panel', async () => {
			const headingText = editor.getPreviewFrame().locator( EditorSelectors.v4.atomSelectors.heading.wrapper ).first();
			expect( headingText ).toContainText( originalHeadingValue );
		} );

		await test.step( 'Verify changing the title still affects the rendered value on canvas', async () => {
			const input = helper.getSettingsField( headingControlLabel ).getByRole( 'textbox' ).first();
			await input.fill( nestedDefaultValue );

			const headingText = editor.getPreviewFrame().locator( EditorSelectors.v4.atomSelectors.heading.wrapper ).first();
			await expect( headingText ).toContainText( nestedDefaultValue );
		} );

		await test.step( 'Exit edit mode and select component instance', async () => {
			await exitComponentEditMode( editor );
		} );

		await test.step( 'Verify component default value is rendered on canvas', async () => {
			const headingText = editor.getPreviewFrame().locator( EditorSelectors.v4.atomSelectors.heading.wrapper ).first();
			await expect( headingText ).toContainText( nestedDefaultValue );
		} );

		await test.step( 'Verify component default value is rendered on frontend', async () => {
			const pageId = await editor.getPageId();
			await editor.publishAndViewPage();

			const headingText = page.locator( 'h2' ).first();
			await expect( headingText ).toContainText( nestedDefaultValue );

			await wpAdminPage.editExistingPostWithElementor( pageId, { page, testInfo } );
		} );

		await test.step( 'Verify exposed prop appears in instance panel and override it', async () => {
			await selectComponentInstance( editor, instanceId );

			const propControl = await getInstancePanelPropInput( page, propLabel );

			await propControl.clear();
			await propControl.fill( overrideValue );

			const headingText = editor.getPreviewFrame().locator( EditorSelectors.v4.atomSelectors.heading.wrapper ).first();
			await expect( headingText ).toContainText( overrideValue );
		} );

		await test.step( 'Create outer component wrapping inner component instance', async () => {
			outerFlexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, 'document' );

			await openComponentsTab( editor, page );

			const componentItem = page.locator( EditorSelectors.components.componentsList ).getByText( componentName );
			await componentItem.click();

			const navigatorItem = await getNavigationItem( page, outerFlexboxId );
			await openCreateComponentFromContextMenu( navigatorItem, page );
			outerInstanceId = await createComponent( page, editor, outerComponentName );

			const backButton = page.locator( EditorSelectors.components.exitEditModeButton );
			await expect( backButton ).toBeVisible( { timeout: timeouts.longAction } );
		} );

		await test.step( 'Expose inner component prop in outer component', async () => {
			const navigatorWrapper = page.locator( EditorSelectors.panels.navigator.wrapper );
			const innerComponentNavItem = navigatorWrapper.locator( '.elementor-navigator__item' ).filter( { hasText: componentName } );
			await innerComponentNavItem.click();

			await createOverridableProp( page, propLabel );

			await exitComponentEditMode( editor );
		} );

		await test.step( 'Override nested prop on outer component instance', async () => {
			await selectComponentInstance( editor, outerInstanceId );

			const propControl = await getInstancePanelPropInput( page, propLabel );
			await propControl.clear();
			await propControl.fill( nestedOverrideValue );
		} );

		await test.step( 'Verify nested prop is overridden on canvas', async () => {
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
		const componentName = uniqueName( 'Styled Component' );
		const backgroundColor = 'rgb(255, 0, 0)';

		await test.step( 'Create a component with styled heading', async () => {
			const { locator: flexbox } = await createContentForComponent( editor );

			const heading = flexbox.locator( EditorSelectors.v4.atomSelectors.heading.wrapper ).first();
			await heading.click();

			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( '#ff0000' );
			await editor.v4Panel.style.closeSection( 'Background' );

			await openCreateComponentFromContextMenu( flexbox, page );
			await createComponent( page, editor, componentName );
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
