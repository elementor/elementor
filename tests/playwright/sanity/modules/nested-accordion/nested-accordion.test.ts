import { test, expect, Locator, Page } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expectScreenshotToMatchLocator, deleteItemFromRepeater, addItemFromRepeater } from './helper';
import _path from 'path';
import { setup } from '../nested-tabs/helper';
import AxeBuilder from '@axe-core/playwright';

test.describe( 'Nested Accordion experiment inactive @nested-accordion', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: 'inactive',
			'nested-elements': 'inactive',
			e_nested_atomic_repeaters: 'active',
		} );

		await page.close();
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			'nested-elements': 'active',
			container: 'active',
			e_nested_atomic_repeaters: 'inactive',
		} );

		await page.close();
	} );

	test( 'Nested-accordion should not appear in widgets panel', async ( { page }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			frame = editor.getPreviewFrame(),
			accordionWrapper = frame.locator( '.elementor-accordion' ).first(),
			toggleWrapper = frame.locator( '.elementor-toggle' ).first();

		await test.step( 'Check that Toggle and Accordion widgets appear when nested accordion experiment is off', async () => {
			// Act
			await editor.addWidget( 'accordion', container );
			await editor.addWidget( 'toggle', container );

			// Assert
			await expect.soft( accordionWrapper ).toHaveCount( 1 );
			await expect.soft( toggleWrapper ).toHaveCount( 1 );
		} );
	} );
} );

test.describe( 'Nested Accordion experiment is active @nested-accordion', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: 'active',
			'nested-elements': 'active',
			e_nested_atomic_repeaters: 'active',
		} );

		await page.close();
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			'nested-elements': 'inactive',
			container: 'inactive',
			e_nested_atomic_repeaters: 'inactive',
		} );

		await page.close();
	} );

	test( 'General Test', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			frame = editor.getPreviewFrame(),
			accordionWrapper = frame.locator( '.elementor-accordion' ).first(),
			toggleWidgetInPanel = page.locator( 'i.eicon-toggle' ).first(),
			widgetPanelButton = page.locator( '#elementor-panel-header-add-button .eicon-apps' ),
			widgetSearchBar = '#elementor-panel-elements-search-wrapper input#elementor-panel-elements-search-input',
			nestedAccordionItemTitle = frame.locator( '.e-n-accordion-item' ),
			nestedAccordionItemContent = nestedAccordionItemTitle.locator( '.e-con' );

		let nestedAccordionID,
			nestedAccordion;

		await test.step( 'Check that Toggle widget does not appear when nested accordion experiment is on', async () => {
			// Act
			await editor.closeNavigatorIfOpen();
			await widgetPanelButton.click();

			await page.waitForSelector( widgetSearchBar );
			await page.locator( widgetSearchBar ).fill( 'toggle' );

			// Assert
			await expect.soft( toggleWidgetInPanel ).toBeHidden();
		} );

		await test.step( 'Check that Nested accordion replaces old accordion widget', async () => {
			// Act
			nestedAccordionID = await editor.addWidget( 'nested-accordion', container );
			nestedAccordion = await editor.selectElement( nestedAccordionID );

			// Assert
			await expect.soft( nestedAccordion ).toHaveCount( 1 );
			await expect.soft( accordionWrapper ).toHaveCount( 0 );
		} );

		await test.step( 'Count number of items in initial state', async () => {
			// Act
			await expect.soft( nestedAccordionItemTitle ).toHaveCount( 3 );
			await expect.soft( nestedAccordionItemContent ).toHaveCount( 3 );

			// Assert
			await expect.soft( toggleWidgetInPanel ).toBeHidden();
		} );

		await test.step( 'Add an item to the repeater', async () => {
			await addItemFromRepeater( editor, nestedAccordionID );
		} );

		await test.step( 'Remove an item from the repeater', async () => {
			await deleteItemFromRepeater( editor, nestedAccordionID );
		} );

		await test.step( 'Duplicate an item to the repeater', async () => {
			// Arrange
			const duplicateButton = page.locator( '.elementor-repeater-tool-duplicate .eicon-copy' ).first(),
				numberOfTitles = await nestedAccordionItemTitle.count(),
				numberOfContents = await nestedAccordionItemContent.count();

			// Act
			await duplicateButton.click();

			// Assert
			await expect.soft( nestedAccordionItemTitle ).toHaveCount( numberOfTitles + 1 );
			await expect.soft( nestedAccordionItemContent ).toHaveCount( numberOfContents + 1 );
		} );

		await test.step( 'Check default state behaviour', async () => {
			const allItems = await nestedAccordionItemTitle.all(),
				allItemsExceptFirst = allItems.slice( 1 );

			await test.step( 'Check default state -> first item is open', async () => {
				await expect.soft( nestedAccordionItemTitle.first() ).toHaveAttribute( 'open', 'true' );

				for ( const item of allItemsExceptFirst ) {
					await expect.soft( item ).not.toHaveAttribute( 'open', '' );
				}
			} );

			await test.step( 'Verify that all items are closed.', async () => {
				await editor.openSection( 'section_interactions' );
				await editor.setSelectControlValue( 'default_state', 'all_collapsed' );

				for ( const item of allItems ) {
					await expect.soft( item ).not.toHaveAttribute( 'open', '' );
				}
			} );

			await test.step( 'Check manual select of first expand -> first item is open', async () => {
				await editor.setSelectControlValue( 'default_state', 'expanded' );
				await expect.soft( nestedAccordionItemTitle.first() ).toHaveAttribute( 'open', 'true' );

				for ( const item of allItemsExceptFirst ) {
					await expect.soft( item ).not.toHaveAttribute( 'open', 'true' );
				}
			} );

			await test.step( 'Check that multiple items can be open', async () => {
				await editor.setSelectControlValue( 'max_items_expended', 'multiple' );

				for ( const item of allItemsExceptFirst ) {
					await item.click();
				}

				for ( const item of allItemsExceptFirst ) {
					await expect.soft( item ).not.toHaveAttribute( 'open', 'true' );
				}
			} );

			await editor.setSelectControlValue( 'max_items_expended', 'one' );
		} );
	} );

	test( 'Nested Accordion Visual Regression Test', async ( { browser }, testInfo ) => {
		// Act
		const page = await browser.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame();

		await editor.loadJsonPageTemplate( __dirname, 'nested-accordion-title-and-icons', '.elementor-widget-n-accordion' );
		await editor.closeNavigatorIfOpen();

		await test.step( 'Widget Editor Screenshot matches intended design', async () => {
			await expectScreenshotToMatchLocator( `nested-accordion-title-and-icons.png`, frame.locator( '.e-n-accordion' ).first() );
		} );

		await test.step( 'Widget FrontEnd Screenshot matches intended design', async () => {
			await editor.publishAndViewPage();
			await expectScreenshotToMatchLocator( `nested-accordion-title-and-icons-fe.png`, page.locator( '.e-n-accordion' ).first() );
		} );
	} );

	test( 'Nested Accordion stays full width in container Direction Row', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' );

		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );

		const frame = editor.getPreviewFrame(),
			nestedAccordionId = await editor.addWidget( 'nested-accordion', containerId ),
			containerElement = frame.locator( `.elementor-element-${ containerId } .e-con-inner` ),
			nestedAccordionElement = frame.locator( `.elementor-element-${ nestedAccordionId }.elementor-widget-n-accordion` ),
			containerWidth = ( await containerElement.boundingBox() ).width,
			nestedAccordionWidth = ( await nestedAccordionElement.boundingBox() ).width;

		expect.soft( nestedAccordionWidth ).toEqual( containerWidth );
	} );

	test( 'Nested Accordion with inner Nested Accordion', async ( { browser }, testInfo ) => {
		// Act
		const page = await browser.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame();

		await test.step( 'Load Template', async () => {
			const filePath = _path.resolve( __dirname, `./templates/nested-accordions-parent-child.json` );
			await editor.loadTemplate( filePath, false );
			await frame.waitForSelector( '.elementor-widget-n-accordion' );
			await editor.closeNavigatorIfOpen();
		} );

		await test.step( 'Verify that the inner accordion doesn\'t inherit styling from parent', async () => {
			expect.soft( await editor.getPreviewFrame()
				.locator( '.e-n-accordion' ).first()
				.screenshot( { type: 'png' } ) )
				.toMatchSnapshot( 'nested-accordions-parent-child.png' );
		} );
	} );

	test( 'Accessibility inside the Editor', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame();

		// Load template.
		await editor.loadJsonPageTemplate( __dirname, 'nested-accordion-accessibility', '.elementor-widget-n-accordion' );
		await frame.waitForSelector( '.e-n-accordion' );

		await test.step( 'Keyboard handling inside the Editor', async () => {
			const accordionTitleOne = frame.locator( '.e-n-accordion-item-title >> nth=0' ),
				accordionTitleTwo = frame.locator( '.e-n-accordion-item-title >> nth=1' ),
				accordionTitleThree = frame.locator( '.e-n-accordion-item-title >> nth=2' ),
				button1 = frame.locator( '.elementor-button >> nth=0' );

			await frame.locator( '.page-header' ).click();
			await checkKeyboardNavigation( page, accordionTitleOne, accordionTitleTwo, button1, accordionTitleThree );
		} );
	} );

	test( 'Accessibility on the Front End', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame();

		// Load template.
		await editor.loadJsonPageTemplate( __dirname, 'nested-accordion-accessibility', '.elementor-widget-n-accordion' );
		await frame.waitForSelector( '.e-n-accordion' );
		await editor.publishAndViewPage();
		await page.waitForSelector( '.e-n-accordion' );

		await test.step( 'Keyboard handling on the Front End', async () => {
			const accordionTitleOne = page.locator( '.e-n-accordion-item-title >> nth=0' ),
				accordionTitleTwo = page.locator( '.e-n-accordion-item-title >> nth=1' ),
				accordionTitleThree = page.locator( '.e-n-accordion-item-title >> nth=2' ),
				button1 = page.locator( '.elementor-button >> nth=0' );

			await page.locator( '.page-header' ).click();
			await checkKeyboardNavigation( page, accordionTitleOne, accordionTitleTwo, button1, accordionTitleThree );
		} );

		await test.step( '@axe-core/playwright', async () => {
			const accessibilityScanResults = await new AxeBuilder( { page } )
				.include( '.e-n-accordion' )
				.analyze();

			expect.soft( accessibilityScanResults.violations ).toEqual( [] );
		} );
	} );
} );

async function checkKeyboardNavigation( page: Page, accordionTitleOne: Locator, accordionTitleTwo: Locator, button1: Locator, accordionTitleThree: Locator ) {
	await page.keyboard.press( 'Tab' );
	await expect.soft( accordionTitleOne ).toBeFocused();
	await expect.soft( accordionTitleOne ).toHaveAttribute( 'aria-expanded', 'false' );

	await page.keyboard.press( 'Enter' );
	await expect.soft( accordionTitleOne ).toBeFocused();
	await expect.soft( accordionTitleOne ).toHaveAttribute( 'aria-expanded', 'true' );
	await expect.soft( button1 ).toBeVisible();

	await page.keyboard.press( 'Tab' );
	await expect.soft( button1 ).toBeFocused();
	await expect.soft( accordionTitleOne ).toHaveAttribute( 'aria-expanded', 'true' );

	await page.keyboard.press( 'Shift+Tab' );
	await expect.soft( accordionTitleOne ).toBeFocused();
	await expect.soft( accordionTitleOne ).toHaveAttribute( 'aria-expanded', 'true' );

	await page.keyboard.press( 'Tab' );
	await expect.soft( button1 ).toBeFocused();
	await expect.soft( accordionTitleOne ).toHaveAttribute( 'aria-expanded', 'true' );

	await page.keyboard.press( 'Escape' );
	await expect.soft( accordionTitleOne ).toBeFocused();
	await expect.soft( accordionTitleOne ).toHaveAttribute( 'aria-expanded', 'false' );
	await expect.soft( button1 ).toBeHidden();

	await page.keyboard.press( 'Space' );
	await expect.soft( accordionTitleOne ).toBeFocused();
	await expect.soft( accordionTitleOne ).toHaveAttribute( 'aria-expanded', 'true' );
	await expect.soft( button1 ).toBeVisible();

	await page.keyboard.press( 'Escape' );
	await expect.soft( accordionTitleOne ).toBeFocused();
	await expect.soft( accordionTitleOne ).toHaveAttribute( 'aria-expanded', 'false' );
	await expect.soft( button1 ).toBeHidden();

	await page.keyboard.press( 'ArrowDown' );
	await expect.soft( accordionTitleTwo ).toBeFocused();
	await expect.soft( accordionTitleTwo ).toHaveAttribute( 'aria-expanded', 'false' );

	await page.keyboard.press( 'ArrowRight' );
	await expect.soft( accordionTitleThree ).toBeFocused();
	await expect.soft( accordionTitleThree ).toHaveAttribute( 'aria-expanded', 'false' );

	await page.keyboard.press( 'ArrowUp' );
	await expect.soft( accordionTitleTwo ).toBeFocused();
	await expect.soft( accordionTitleTwo ).toHaveAttribute( 'aria-expanded', 'false' );

	await page.keyboard.press( 'ArrowLeft' );
	await expect.soft( accordionTitleOne ).toBeFocused();
	await expect.soft( accordionTitleOne ).toHaveAttribute( 'aria-expanded', 'false' );
}
