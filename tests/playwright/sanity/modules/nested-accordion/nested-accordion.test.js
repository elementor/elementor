import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Nested Accordion @nested-accordion', () => {
	test.describe( 'Nested Accordion experiment inactive', () => {
		test.beforeAll( async ( { browser }, testInfo ) => {
			const page = await browser.newPage();
			const wpAdmin = await new WpAdminPage( page, testInfo );

			await wpAdmin.setExperiments( {
				container: 'active',
				'nested-elements': 'active',
				'nested-accordion': 'inactive',
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
			} );

			await page.close();
		} );

		test( 'Nested-accordion should not appear in widgets panel', async ( { page }, testInfo ) => {
			// Arrange
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.useElementorCleanPost(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				frame = editor.getPreviewFrame(),
				accordionWrapper = await frame.locator( '.elementor-accordion' ).first(),
				toggleWrapper = await frame.locator( '.elementor-toggle' ).first();

			await test.step( 'Check that Toggle and Accordion widgets appear when nested accordion experiment is off', async () => {
				// Act
				await editor.addWidget( 'accordion', container );
				await editor.addWidget( 'toggle', container );

				// Assert
				await expect( await accordionWrapper ).toHaveCount( 1 );
				await expect( await toggleWrapper ).toHaveCount( 1 );
			} );
		} );
	} );

	test.describe( 'Nested Accordion experiment is active', () => {
		test.beforeAll( async ( { browser }, testInfo ) => {
			const page = await browser.newPage();
			const wpAdmin = await new WpAdminPage( page, testInfo );

			await wpAdmin.setExperiments( {
				container: 'active',
				'nested-elements': 'active',
				'nested-accordion': 'active',
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
				'nested-accordion': 'inactive',
			} );

			await page.close();
		} );

		test( 'General Test', async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.useElementorCleanPost(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				frame = editor.getPreviewFrame(),
				accordionWrapper = await frame.locator( '.elementor-accordion' ).first(),
				toggleWidgetInPanel = await page.locator( 'i.eicon-toggle' ).first(),
				widgetPanelButton = await page.locator( '#elementor-panel-header-add-button .eicon-apps' ),
				widgetSearchBar = '#elementor-panel-elements-search-wrapper input#elementor-panel-elements-search-input',
				nestedAccordionItemTitle = await frame.locator( '.e-n-accordion-item' ),
				nestedAccordionItemContent = nestedAccordionItemTitle.locator( '.e-con' );

			let nestedAccordionID,
				nestedAccordion;

			await test.step( 'Check that Toggle widget does not appear when nested accordion experiment is on', async () => {
				// Act
				await editor.closeNavigatorIfOpen();
				widgetPanelButton.click();

				await page.waitForSelector( widgetSearchBar );
				await page.locator( widgetSearchBar ).fill( 'toggle' );

				// Assert
				await expect( toggleWidgetInPanel ).toBeHidden();
			} );

			await test.step( 'Check that Nested accordion replaces old accordion widget', async () => {
				// Act
				nestedAccordionID = await editor.addWidget( 'nested-accordion', container );
				nestedAccordion = await editor.selectElement( nestedAccordionID );

				// Assert
				await expect( await nestedAccordion ).toHaveCount( 1 );
				await expect( accordionWrapper ).toHaveCount( 0 );
			} );

			await test.step( 'Count number of items in initial state', async () => {
				// Act
				await expect( nestedAccordionItemTitle ).toHaveCount( 3 );
				await expect( nestedAccordionItemContent ).toHaveCount( 3 );

				// Assert
				await expect( toggleWidgetInPanel ).toBeHidden();
			} );

			await test.step( 'Add an item to the repeater', async () => {
				// Arrange
				const addItemButton = await page.locator( '.elementor-repeater-add' ),
					numberOfTitles = await nestedAccordionItemTitle.count(),
					numberOfContents = await nestedAccordionItemContent.count();

				// Act
				addItemButton.click();

				// Assert
				await expect( nestedAccordionItemTitle ).toHaveCount( await numberOfTitles + 1 );
				await expect( nestedAccordionItemContent ).toHaveCount( await numberOfContents + 1 );
			} );

			await test.step( 'Remove an item from the repeater', async () => {
				// Arrange
				const deleteItemButton = await page.locator( '.elementor-repeater-row-tool.elementor-repeater-tool-remove .eicon-close' ),
					numberOfTitles = await nestedAccordionItemTitle.count(),
					numberOfContents = await nestedAccordionItemContent.count();

				// Act
				deleteItemButton.last().click();

				// Assert
				await expect( nestedAccordionItemTitle ).toHaveCount( await numberOfTitles - 1 );
				await expect( nestedAccordionItemContent ).toHaveCount( await numberOfContents - 1 );
			} );
		} );

		test( 'Accordion style Tests', async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.openNewPage(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				frame = editor.getPreviewFrame(),
				nestedAccordionItemTitle = await frame.locator( '.e-n-accordion-item' ),
				nestedAccordionItemContent = nestedAccordionItemTitle.locator( '.e-con' );

			await test.step( 'Add Widget and navigate to Style Tab', async () => {
				// Act
				await editor.addWidget( 'nested-accordion', container );
				await editor.activatePanelTab( 'style' );
				await editor.openSection( 'section_accordion_style' );
			} );

			await test.step( 'space between items should be applied to all items but the last one', async () => {
				// Act
				await editor.setSliderControlValue( 'accordion_item_title_space_between', '15' );

				// Assert.
				await expect( nestedAccordionItemTitle.first() ).toHaveCSS( 'margin-bottom', '15px' );
				await expect( nestedAccordionItemTitle.last() ).toHaveCSS( 'margin-bottom', '0px' );
			} );
			await test.step( 'Distance from content should not be applied to closed items', async () => {
				// Act
				await editor.setSliderControlValue( 'accordion_item_title_distance_from_content', '5' );

				// Assert.
				await expect( nestedAccordionItemContent.first() ).toHaveCSS( 'margin-top', '0px' );
			} );
			await test.step( 'Distance from content should  be applied to open items', async () => {
				// Act
				nestedAccordionItemTitle.first().click();
				await editor.setSliderControlValue( 'accordion_item_title_distance_from_content', '5' );

				// Assert.
				await expect( nestedAccordionItemContent.first() ).toHaveCSS( 'margin-top', '0px' );

				// Restore to previous state
				nestedAccordionItemTitle.first().click();
			} );
			await test.step( 'Normal background color and border style should be applied to closed item', async () => {
				// Act
				await setBorderAndBackground( editor, 'normal', '#ff0000', 'solid', '#00ff00' );

				// Assert
				await expect( nestedAccordionItemTitle.first() ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );
				await expect( nestedAccordionItemTitle.first() ).toHaveCSS( 'border-style', 'solid' );
				await expect( nestedAccordionItemTitle.first() ).toHaveCSS( 'border-color', 'rgb(0, 255, 0)' );
			} );
			await test.step( 'Hover background color and border style should be applied on hovering', async () => {
				// Act
				await setBorderAndBackground( editor, 'hover', '#00ff00', 'dashed', '#0000ff' );
				nestedAccordionItemTitle.first().hover();

				// Assert
				await expect( nestedAccordionItemTitle.first() ).toHaveCSS( 'background-color', 'rgb(0, 255, 0)' );
				await expect( nestedAccordionItemTitle.first() ).toHaveCSS( 'border-style', 'dashed' );
				await expect( nestedAccordionItemTitle.first() ).toHaveCSS( 'border-color', 'rgb(0, 0, 255)' );
			} );

			await test.step( 'Active background color and border style should be applied to open items', async () => {
				// Act
				await setBorderAndBackground( editor, 'active', '#0000ff', 'dotted', '#ff0000' );
				nestedAccordionItemTitle.first().click();

				// Assert
				await expect( nestedAccordionItemTitle.first() ).toHaveCSS( 'background-color', 'rgb(0, 0, 255)' );
				await expect( nestedAccordionItemTitle.first() ).toHaveCSS( 'border-style', 'dotted' );
				await expect( nestedAccordionItemTitle.first() ).toHaveCSS( 'border-color', 'rgb(255, 0, 0)' );
			} );

			await test.step( 'Border radius values should affect all items', async () => {
				// Act
				await page.locator( '.elementor-control-accordion_border_radius .elementor-control-dimensions li:first-child input' ).fill( '25' );

				// Assert
				await expect( nestedAccordionItemTitle.first() ).toHaveCSS( 'border-radius', '25px' );
				await expect( nestedAccordionItemTitle.last() ).toHaveCSS( 'border-radius', '25px' );
			} );

			await test.step( 'Padding values should affect all items', async () => {
				// Act
				await page.locator( '.elementor-control-accordion_padding .elementor-control-dimensions li:first-child input' ).fill( '50' );

				// Assert
				await expect( nestedAccordionItemTitle.first() ).toHaveCSS( 'padding', '50px' );
			} );
		} );
	} );
} );

async function setBorderAndBackground( editor, state, color, borderType, borderColor ) {
	await setState();
	await setBackgroundColor();
	await setBorderType();
	await setBorderColor();

	async function setBackgroundColor() {
		await editor.page.locator( '.elementor-control-accordion_background_' + state + '_background .eicon-paint-brush' ).click();
		await editor.setColorControlValue( color, 'accordion_background_' + state + '_color' );
	}

	async function setBorderType() {
		await editor.page.selectOption( '.elementor-control-accordion_border_' + state + '_border >> select', { value: borderType } );
	}

	async function setBorderColor() {
		await editor.setColorControlValue( borderColor, 'accordion_border_' + state + '_color' );
	}

	async function setState() {
		await editor.page.click( '.elementor-control-accordion_' + state + '_border_and_background' );
	}
}
