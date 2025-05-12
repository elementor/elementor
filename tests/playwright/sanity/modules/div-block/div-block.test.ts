import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import widgets from '../../../enums/widgets';
import { getElementSelector } from '../../../assets/elements-utils';
import { expect } from '@playwright/test';

test.describe( 'Div Block tests @div-block', () => {
	const experimentName = 'e_atomic_elements';

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			[ experimentName ]: 'active',
		} );
		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Sort items in a Div Block using DnD', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			divBlock = await editor.addElement( { elType: 'e-div-block' }, 'document' ),
			heading = await editor.addWidget( { widgetType: widgets.heading, container: divBlock } ),
			button = await editor.addWidget( { widgetType: widgets.button, container: divBlock } ),
			image = await editor.addWidget( { widgetType: widgets.image, container: divBlock } );

		await editor.previewFrame.dragAndDrop(
			getElementSelector( button ),
			getElementSelector( image ),
		);
		const buttonEl = await editor.getElementHandle( button ),
			headingEl = await editor.getElementHandle( heading );

		const elBeforeButton = await buttonEl.evaluate( ( node ) => node.previousElementSibling ),
			elAfterHeading = await headingEl.evaluate( ( node ) => node.nextElementSibling );

		// Assert.
		// Test that the image is between the heading & button.
		expect.soft( elBeforeButton ).toEqual( elAfterHeading );
	} );

	test( 'Nested Div block with widget', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		// Act.
		const editor = await wpAdmin.openNewPage(),
			parentDivBlock = await editor.addElement( { elType: 'e-div-block' }, 'document' ),
			childDivBlock = await editor.addElement( { elType: 'e-div-block' }, parentDivBlock ),
			heading = await editor.addWidget( { widgetType: widgets.heading, container: childDivBlock } ),
			button = await editor.addWidget( { widgetType: widgets.button, container: parentDivBlock } ),
			image = await editor.addWidget( { widgetType: widgets.image, container: childDivBlock } ),

			// Arrange.
			locatorParentDivBlock = page.locator( getElementSelector( parentDivBlock ) ),
			locatorChildDivBlock = page.locator( getElementSelector( childDivBlock ) ),
			elChildDivBlock = getElementSelector( childDivBlock ),
			headingInsideChildDivBlock = getElementSelector( heading ),
			buttonInsideParentDivBlock = getElementSelector( button ),
			imageInsideChildDivBlock = getElementSelector( image ),

			divBlockChildrenCount = await locatorParentDivBlock.locator( `${ headingInsideChildDivBlock }, ${ elChildDivBlock }, ${ buttonInsideParentDivBlock }, ${ imageInsideChildDivBlock }` ).count(),
			childDivBlockChildrenCount = await locatorChildDivBlock.locator( `${ headingInsideChildDivBlock }, ${ imageInsideChildDivBlock }` ).count();

		// Assert
		expect( divBlockChildrenCount ).toBe( 4 );
		expect( childDivBlockChildrenCount ).toBe( 2 );
	} );

	test.skip( 'Div block should render styles after refresh', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			divBlock = await editor.addElement( { elType: 'e-div-block' }, 'document' );

		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'background' );

		const inputLocator = page.locator( '.MuiGrid-item:has-text("Color") + .MuiGrid-item input' );

		await inputLocator.fill( '#8d101080' );
		await editor.saveAndReloadPage();

		const divBlockLocator = editor.getPreviewFrame().locator( `[data-id="${ divBlock }"]` );

		await expect( divBlockLocator ).toHaveCSS( 'background-color', /[rgba\(141, 16, 16, 0.5\)|\#8d101080]/ );
	} );

	test( 'Div block handles-position test', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Div block as first container', async () => {
			// Arrange.
			const firstDivBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
			const secondContainerId = await editor.addElement( { elType: 'container' }, 'document' );

			const firstDivBlock = editor.getPreviewFrame().locator( `[data-id="${ firstDivBlockId }"]` );
			const secondContainer = editor.getPreviewFrame().locator( `[data-id="${ secondContainerId }"]` );

			const firstDivBlockHandles = firstDivBlock.locator( '.elementor-editor-element-settings' );
			const secondContainerHandles = secondContainer.locator( '.elementor-editor-element-settings' );

			// Act.
			await firstDivBlock.hover();
			await firstDivBlockHandles.waitFor();

			// Assert.
			await expect( firstDivBlockHandles ).toHaveScreenshot( 'flipped-handles.png' );

			// Act.
			await secondContainerHandles.hover();
			await secondContainerHandles.waitFor();

			// Assert.
			await expect( secondContainerHandles ).toHaveScreenshot( 'normal-handles.png' );
		} );
	} );
} );
