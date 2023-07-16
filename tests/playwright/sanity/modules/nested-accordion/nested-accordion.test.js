import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { colors } from '../../../enums/colors';
import { borderStyle } from '../../../enums/border-styles';
import { displayState } from '../../../enums/display-states';

test.describe( 'Nested Accordion @nested-accordion', () => {
	test.describe( 'Nested Elements experiment inactive', () => {
		test.beforeAll( async ( { browser }, testInfo ) => {
			const page = await browser.newPage();
			const wpAdmin = await new WpAdminPage( page, testInfo );

			await wpAdmin.setExperiments( {
				container: 'active',
				'nested-elements': 'inactive',
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

	test.describe( 'Nested Elements experiment is active', () => {
		test.beforeAll( async ( { browser }, testInfo ) => {
			const page = await browser.newPage();
			const wpAdmin = await new WpAdminPage( page, testInfo );

			await wpAdmin.setExperiments( {
				container: 'active',
				'nested-elements': 'active',
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
				await widgetPanelButton.click();

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
				await addItemButton.click();

				// Assert
				await expect( nestedAccordionItemTitle ).toHaveCount( numberOfTitles + 1 );
				await expect( nestedAccordionItemContent ).toHaveCount( numberOfContents + 1 );
			} );

			await test.step( 'Remove an item from the repeater', async () => {
				// Arrange
				const deleteItemButton = await page.locator( '.elementor-repeater-row-tool.elementor-repeater-tool-remove .eicon-close' ),
					numberOfTitles = await nestedAccordionItemTitle.count(),
					numberOfContents = await nestedAccordionItemContent.count();

				// Act
				await deleteItemButton.last().click();

				// Assert
				await expect( nestedAccordionItemTitle ).toHaveCount( numberOfTitles - 1 );
				await expect( nestedAccordionItemContent ).toHaveCount( numberOfContents - 1 );
			} );

			await test.step( 'Check default state behaviour', async () => {
				// Check default state -> first item is open
				await expect( nestedAccordionItemTitle.first() ).toHaveAttribute( 'open', 'true' );

				const allItems = await nestedAccordionItemTitle.all(),
					allItemsExceptFirst = allItems.slice( 1 );

				for ( const item of allItemsExceptFirst ) {
					await expect( item ).not.toHaveAttribute( 'open', '' );
				}

				//  Verify that all items are closed.
				await editor.openSection( 'section_interactions' );
				await editor.setSelectControlValue( 'default_state', 'all_collapsed' );

				for ( const item of allItems ) {
					await expect( item ).not.toHaveAttribute( 'open', '' );
				}

				// Check manual select of first expand -> first item is open
				await editor.setSelectControlValue( 'default_state', 'expanded' );
				await expect( nestedAccordionItemTitle.first() ).toHaveAttribute( 'open', 'true' );

				for ( const item of allItemsExceptFirst ) {
					await expect( item ).not.toHaveAttribute( 'open', 'true' );
				}
			} );

			await test.step( 'Check that each item has a different id value on frontend', async () => {
				await editor.publishAndViewPage();

				const firstItemID = await page.locator( '.e-n-accordion-item >> nth=0' ).first().getAttribute( 'id' ),
					secondItemID = await page.locator( '.e-n-accordion-item >> nth=1' ).first().getAttribute( 'id' ),
					thirdItemID = await page.locator( '.e-n-accordion-item >> nth=2' ).first().getAttribute( 'id' );

				await expect( firstItemID ).not.toEqual( secondItemID );
				await expect( secondItemID ).not.toEqual( thirdItemID );
				await expect( thirdItemID ).not.toEqual( firstItemID );
			} );
		} );

		test( 'Nested Accordion animation', async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.useElementorCleanPost(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				frame = editor.getPreviewFrame(),
				nestedAccordionID = await editor.addWidget( 'nested-accordion', container ),
				animationDuration = 500;

			await editor.closeNavigatorIfOpen();
			await editor.selectElement( nestedAccordionID );

			await test.step( 'Check closing animation', async () => {
				const itemVisibilityBeforeAnimation = await frame.isVisible( '.e-n-accordion-item:first-child > .e-con' );

				expect( itemVisibilityBeforeAnimation ).toEqual( true );

				await frame.locator( '.e-n-accordion-item:first-child > .e-n-accordion-item-title' ).click();

				// Wait for the closing animation to complete
				await page.waitForTimeout( animationDuration );

				// Check the computed height
				const maxHeightAfterClose = await frame.locator( '.e-n-accordion-item:first-child > .e-con' ).evaluate( ( element ) =>
					window.getComputedStyle( element ).getPropertyValue( 'height' ),
				);

				expect( maxHeightAfterClose ).toEqual( '0px' );
			} );

			await test.step( 'Check open animation', async () => {
				const itemVisibilityBeforeAnimation = await frame.isVisible( '.e-n-accordion-item:first-child > .e-con' );

				expect( itemVisibilityBeforeAnimation ).toEqual( false );

				await frame.locator( '.e-n-accordion-item:first-child > .e-n-accordion-item-title' ).click();

				// Wait for the open animation to complete
				await page.waitForTimeout( animationDuration );

				// Check the computed height
				const maxHeightAfterOpen = await frame.locator( '.e-n-accordion-item:first-child > .e-con' ).evaluate( ( element ) =>
					window.getComputedStyle( element ).getPropertyValue( 'height' ),
				);

				expect( maxHeightAfterOpen ).not.toEqual( '0px' );
			} );
		} );

		test.skip( 'Nested Accordion Visual Regression Test', async ( { browser }, testInfo ) => {
			// Act
			const page = await browser.newPage(),
				wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.useElementorCleanPost(),
				frame = editor.getPreviewFrame();

			await editor.loadJsonPageTemplate( __dirname, 'nested-accordion-title-and-icons', '.elementor-widget-n-accordion' );
			await editor.closeNavigatorIfOpen();

			await test.step( 'Widget Editor Screenshot matches intended design', async () => {
				await screenshotWidget( `nested-accordion-title-and-icons.jpg`, frame.locator( '.e-n-accordion' ).first() );
			} );

			await test.step( 'Widget FrontEnd Screenshot matches intended design', async () => {
				await editor.publishAndViewPage();
				await screenshotWidget( `nested-accordion-title-and-icons-fe.jpg`, page.locator( '.e-n-accordion' ).first() );
			} );
		} );

		test.skip( 'Nested Accordion Title, Text and Icon Position', async ( { browser }, testInfo ) => {
			// Act
			const page = await browser.newPage(),
				wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.useElementorCleanPost();

			await editor.loadJsonPageTemplate( __dirname, 'nested-accordion-title-and-icons', '.elementor-widget-n-accordion' );

			await editor.closeNavigatorIfOpen();

			const nestedAccordionWidgetId = '48f02ad',
				frame = editor.getPreviewFrame(),
				nestedAccordion = frame.locator( '.e-n-accordion' ).filter( { hasText: 'One' } ),
				nestedAccordionTitle = frame.locator( 'summary' ).first().filter( { hasText: 'One' } );

			await test.step( 'Check that the title icon is displayed', async () => {
				// Assert
				await expect( await nestedAccordion.locator( 'i' ).nth( 0 ) ).toBeVisible();
				await expect( await nestedAccordion.locator( 'i' ).nth( 1 ) ).toHaveClass( 'fas fa-plus' );
				await expect( await frame.getByRole( 'group' ).filter( { hasText: 'One' } ).locator( 'i' ).nth( 1 ) ).toBeHidden();
			} );

			await test.step( 'Check that icon changes when Accordion is opened', async () => {
				await frame.waitForLoadState( 'load', { timeout: 7000 } );
				await nestedAccordionTitle.click( { timeout: 5000 } );
				await expect( await getIcon( nestedAccordion, 0 ) ).toBeVisible();
				await expect( await getIcon( nestedAccordion, 0 ) ).toHaveClass( 'fas fa-minus' );
				await expect( await nestedAccordion.locator( 'i' ).nth( 1 ) ).toBeHidden();
				await nestedAccordionTitle.click( { timeout: 5000 } );
			} );

			await editor.selectElement( nestedAccordionWidgetId );

			await test.step( 'Check title position default start', async () => {
				await editor.selectElement( nestedAccordionWidgetId );
				// Assert
				// Normal = Flex-start
				await expect( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'normal' );
				await page.locator( '.elementor-control-accordion_item_title_position_horizontal .elementor-control-input-wrapper .eicon-align-start-h' ).click();
				await frame.waitForLoadState( 'load' );
				await expect( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'normal' );
			} );

			await test.step( 'Check title position end', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await page.locator( '.elementor-control-accordion_item_title_position_horizontal .elementor-control-input-wrapper .eicon-align-end-h' ).click();
				// Assert
				await frame.waitForLoadState( 'load' );
				await expect( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'flex-end' );
			} );

			await test.step( 'Check title position center', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await page.locator( '.elementor-control-accordion_item_title_position_horizontal .elementor-control-input-wrapper .eicon-h-align-center' ).click();
				// Assert
				await frame.waitForLoadState( 'load' );
				await expect( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'center' );
			} );

			await test.step( 'Check title position justify', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await page.locator( '.elementor-control-accordion_item_title_position_horizontal .elementor-control-input-wrapper .eicon-h-align-stretch' ).click();
				// Assert
				await frame.waitForLoadState( 'load' );
				await expect( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'space-between' );
			} );

			await test.step( 'Check title icon position left', async () => {
				// Assert
				await expect( nestedAccordionTitle.locator( '.e-n-accordion-item-title-icon' ) ).toHaveCSS( 'order', '-1' );
			} );

			await test.step( 'Check title icon position right', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await page.locator( '.elementor-control-accordion_item_title_icon_position .elementor-control-input-wrapper .eicon-h-align-right' ).click();
				// Assert
				await frame.waitForLoadState( 'load' );
				await expect( nestedAccordionTitle.locator( '.e-n-accordion-item-title-icon' ) ).toHaveCSS( 'order', '0' );
			} );

			await test.step( 'Change to mobile mode', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await page.getByText( 'Desktop Tablet Portrait Mobile Portrait' ).first().click();
				await page.getByRole( 'button', { name: 'Mobile Portrait' } ).first().click();
			} );

			await test.step( 'Mobile -Check that the title icon is displayed', async () => {
				// Assert
				await expect( await getIcon( nestedAccordion, 1 ) ).toBeVisible();
				await expect( await getIcon( nestedAccordion, 1 ) ).toHaveClass( 'fas fa-plus' );

				await expect( await frame.getByRole( 'group' ).filter( { hasText: 'One' } ).locator( 'i' ).nth( 0 ) ).toBeHidden();
			} );

			await test.step( 'Mobile - Check that icon changes when the mobile Accordion is opened', async () => {
				await frame.waitForLoadState( 'load' );
				await nestedAccordionTitle.click();
				await expect( await getIcon( nestedAccordion, 0 ) ).toBeVisible();
				await expect( await getIcon( nestedAccordion, 0 ) ).toHaveClass( 'fas fa-minus' );
				await expect( await getIcon( nestedAccordion, 1 ) ).toBeHidden();
				await nestedAccordionTitle.click();
			} );

			await test.step( 'Mobile - Check title position mobile is default start', async () => {
				// Assert
				await expect( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'normal' );
			} );

			await test.step( 'Mobile - Check title position mobile is flex-end', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await page.locator( '.elementor-control-accordion_item_title_position_horizontal_mobile .elementor-control-input-wrapper .eicon-align-end-h' ).click();
				// Assert
				await frame.waitForLoadState( 'load' );
				await expect( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'flex-end' );
			} );

			await test.step( 'Mobile - Check title position mobile is center', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await page.locator( '.elementor-control-accordion_item_title_position_horizontal_mobile .elementor-control-input-wrapper .eicon-h-align-center' ).click();
				// Assert
				await frame.waitForLoadState( 'load' );
				await expect( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'center' );
			} );

			await test.step( 'Mobile - Check title position mobile is justify', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await page.locator( '.elementor-control-accordion_item_title_position_horizontal_mobile .elementor-control-input-wrapper .eicon-h-align-stretch' ).click();
				// Assert
				await frame.waitForLoadState( 'load' );
				await expect( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'space-between' );
			} );

			await test.step( 'Mobile - Check title icon position right', async () => {
				// Assert
				await expect( nestedAccordionTitle.locator( '.e-n-accordion-item-title-icon' ) ).toHaveCSS( 'order', '0' );
			} );

			await test.step( 'Mobile - Check title icon position left', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await page.locator( '.elementor-control-accordion_item_title_icon_position_mobile .elementor-control-input-wrapper .eicon-h-align-left' ).click();
				// Assert
				await frame.waitForLoadState( 'load' );
				await expect( nestedAccordionTitle.locator( '.e-n-accordion-item-title-icon' ) ).toHaveCSS( 'order', '-1' );
			} );
		} );

		test( 'Nested Accordion Title Icon and Text Vertical Alignment', async ( { browser }, testInfo ) => {
			const page = await browser.newPage(),
				wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.useElementorCleanPost();

			await editor.loadJsonPageTemplate( __dirname, 'nested-accordion-title-and-icons', '.elementor-widget-n-accordion' );

			await editor.closeNavigatorIfOpen();

			const nestedAccordionWidgetId = '48f02ad',
				frame = editor.getPreviewFrame();

			await test.step( 'Check title <h1> text and icon  alignment', async () => {
				const tag = 'h1';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await screenshotWidget( `nested-accordion-title-${ tag }-alignment.jpg`, frame.locator( '.e-n-accordion' ).first() );
			} );
			await test.step( 'Check title <h2> text and icon alignment', async () => {
				const tag = 'h2';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await screenshotWidget( `nested-accordion-title-${ tag }-alignment.jpg`, frame.locator( '.e-n-accordion' ).first() );
			} );
			await test.step( 'Check title <h3> text and icon alignment', async () => {
				const tag = 'h3';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await screenshotWidget( `nested-accordion-title-${ tag }-alignment.jpg`, frame.locator( '.e-n-accordion' ).first() );
			} );
			await test.step( 'Check title <h4> text and icon alignment', async () => {
				const tag = 'h4';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await screenshotWidget( `nested-accordion-title-${ tag }-alignment.jpg`, frame.locator( '.e-n-accordion' ).first() );
			} );
			await test.step( 'Check title <h5> text and icon alignment', async () => {
				const tag = 'h5';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await screenshotWidget( `nested-accordion-title-${ tag }-alignment.jpg`, frame.locator( '.e-n-accordion' ).first() );
			} );
			await test.step( 'Check title <h6> text and icon alignment', async () => {
				const tag = 'h6';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await screenshotWidget( `nested-accordion-title-${ tag }-alignment.jpg`, frame.locator( '.e-n-accordion' ).first() );
			} );
			await test.step( 'Check title <p> text and icon alignment', async () => {
				const tag = 'p';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await screenshotWidget( `nested-accordion-title-${ tag }-alignment.jpg`, frame.locator( '.e-n-accordion' ).first() );
			} );
			await test.step( 'Check title <span> text and icon alignment', async () => {
				const tag = 'span';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await screenshotWidget( `nested-accordion-title-${ tag }-alignment.jpg`, frame.locator( '.e-n-accordion' ).first() );
			} );
			await test.step( 'Check title <div> text and icon alignment', async () => {
				const tag = 'div';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await screenshotWidget( `nested-accordion-title-${ tag }-alignment.jpg`, frame.locator( '.e-n-accordion' ).first() );
			} );
		} );

		test.skip( 'Accordion style tests', async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.openNewPage(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				frame = editor.getPreviewFrame(),
				nestedAccordionItem = await frame.locator( '.e-n-accordion-item' ),
				nestedAccordionItemTitle = await frame.locator( '.e-n-accordion-item-title' ),
				nestedAccordionWidgetFront = await page.locator( '.e-n-accordion' ),
				nestedAccordionItemTitleFront = await nestedAccordionWidgetFront.locator( '.e-n-accordion-item-title' );

			let nestedAccordionID,
				nestedAccordion;

			await test.step( 'Editor', async () => {
				await test.step( 'Add Widget and navigate to Style Tab', async () => {
					// Act
					await editor.closeNavigatorIfOpen();
					nestedAccordionID = await editor.addWidget( 'nested-accordion', container );
					nestedAccordion = await editor.selectElement( nestedAccordionID );
					nestedAccordionItem.first().click();

					await editor.activatePanelTab( 'style' );
					await editor.openSection( 'section_accordion_style' );
				} );

				await editor.setSliderControlValue( 'accordion_item_title_space_between', '15' );
				await editor.setSliderControlValue( 'accordion_item_title_distance_from_content', '5' );
				await setBorderAndBackground( editor, 'normal', colors.red.hex, borderStyle.solid, colors.green.hex );
				await setBorderAndBackground( editor, 'hover', colors.green.hex, borderStyle.dashed, colors.blue.hex );
				await setBorderAndBackground( editor, 'active', colors.blue.hex, borderStyle.dotted, colors.red.hex );
				await editor.setDimensionsValue( 'accordion_border_radius', '25' );
				await editor.setDimensionsValue( 'accordion_padding', '10' );
				nestedAccordionItemTitle.nth( 2 ).hover();
				await expect( nestedAccordion ).toHaveScreenshot( 'accordion-style-editor.png' );
			} );

			await test.step( 'Frontend', async () => {
				// Act
				await editor.publishAndViewPage();

				// Act
				nestedAccordionItemTitleFront.nth( 2 ).hover();
				await expect( nestedAccordionWidgetFront ).toHaveScreenshot( 'accordion-style-front.png' );
			} );
		} );

		test.skip( 'Content style Tests', async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.openNewPage(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				frame = editor.getPreviewFrame(),
				nestedAccordionItemTitle = await frame.locator( '.e-n-accordion-item' ),
				nestedAccordionItemContent = nestedAccordionItemTitle.locator( '.e-con' );

			await editor.closeNavigatorIfOpen();
			const nestedAccordionID = await editor.addWidget( 'nested-accordion', container );
			const nestedAccordion = await editor.selectElement( nestedAccordionID );
			await editor.activatePanelTab( 'style' );
			await editor.openSection( 'section_content_style' );

			await test.step( 'open accordion', async () => {
				for ( let i = 1; i < await nestedAccordionItemContent.count(); i++ ) {
					await nestedAccordionItemTitle.nth( i ).click();
					await nestedAccordionItemContent.nth( i ).waitFor( { state: 'visible' } );
				}
			} );

			await test.step( 'set background', async () => {
				// Act
				await editor.page.locator( '.elementor-control-content_background_background .eicon-paint-brush' ).click();
				await editor.setColorControlValue( colors.red.hex, 'content_background_color' );
			} );

			await test.step( 'Set Border controls', async () => {
				// Act
				await editor.page.selectOption( '.elementor-control-content_border_border >> select', { value: borderStyle.solid } );
				await editor.setDimensionsValue( 'content_border_width', '5' );
				await editor.setColorControlValue( colors.blue.hex, 'content_border_color' );
				await editor.setDimensionsValue( 'content_border_radius', '25' );
			} );

			await test.step( 'set padding', async () => {
				// Act
				await editor.setDimensionsValue( 'content_padding', '50' );
			} );

			await test.step( 'compare editor images', async () => {
				await expect( nestedAccordion ).toHaveScreenshot( 'nested-Accordion-content-style.png' );
			} );

			await test.step( 'Container\'s style should override item\'s style', async () => {
				await test.step( 'Open container settings', async () => {
					// Act
					await nestedAccordionItemContent.first().hover();
					await nestedAccordionItemTitle.first().locator( '.elementor-editor-container-settings' ).click();
				} );

				await test.step( 'override background and border', async () => {
					// Act
					await editor.activatePanelTab( 'style' );
					await editor.openSection( 'section_background' );
					await editor.page.locator( '.elementor-control-background_background .eicon-paint-brush' ).click();
					await editor.setColorControlValue( colors.black.hex, 'background_color' );
					await editor.openSection( 'section_border' );
					await editor.page.selectOption( '.elementor-control-border_border >> select', { value: borderStyle.dotted } );
					await editor.setDimensionsValue( 'border_width', '12' );
					await editor.setColorControlValue( colors.purple.hex, 'border_color' );
					await editor.setDimensionsValue( 'border_radius', '30' );
				} );

				await test.step( 'override padding', async () => {
					// Act
					await editor.activatePanelTab( 'advanced' );
					await editor.setDimensionsValue( 'padding', '22' );
				} );

				await test.step( 'compare container override', async () => {
					await expect( nestedAccordion ).toHaveScreenshot( 'nested-Accordion-content-style-override.png' );
				} );

				await test.step( 'compare frontend', async () => {
					// Act
					await editor.publishAndViewPage();
					const nestedAccordionWidgetFront = await page.locator( '.e-n-accordion' ),
						nestedAccordionItemTitleFront = await nestedAccordionWidgetFront.locator( '.e-n-accordion-item-title' );

					await test.step( 'open accordion', async () => {
						for ( let i = 1; i < await nestedAccordionItemTitleFront.count(); i++ ) {
							await nestedAccordionItemTitleFront.nth( i ).click();
						}
					} );

					// Assert.
					await expect( nestedAccordionWidgetFront ).toHaveScreenshot( 'nested-Accordion-content-style-front.png' );
				} );
			} );
		} );

		test.skip( 'Header style tests', async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.openNewPage(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				frame = editor.getPreviewFrame(),
				nestedAccordionItem = await frame.locator( '.e-n-accordion-item' ),
				nestedAccordionItemContent = nestedAccordionItem.locator( '.e-con' ),
				nestedAccordionWidgetFront = await page.locator( '.e-n-accordion' ),
				nestedAccordionItemFront = await nestedAccordionWidgetFront.locator( '.e-n-accordion-item' );

			let nestedAccordionID,
				nestedAccordion;

			await test.step( 'Editor', async () => {
				await test.step( 'Add Widget and navigate to Style Tab', async () => {
					// Act
					await editor.closeNavigatorIfOpen();
					nestedAccordionID = await editor.addWidget( 'nested-accordion', container );
					nestedAccordion = await editor.selectElement( nestedAccordionID );

					await editor.activatePanelTab( 'style' );
					await editor.openSection( 'section_header_style' );
				} );
				await test.step( 'set header style', async () => {
					// Act
					await editor.setTypography( 'title_typography', 70 );
					await editor.setSliderControlValue( 'icon_size', 70 );
					await editor.setSliderControlValue( 'icon_spacing', 70 );
					await setIconColor( editor, displayState.normal, colors.green.hex, 'title' );
					await setIconColor( editor, displayState.hover, colors.blue.hex, 'title' );
					await setIconColor( editor, displayState.active, colors.red.hex, 'title' );
					await setIconColor( editor, displayState.normal, colors.red.hex, 'icon' );
					await setIconColor( editor, displayState.hover, colors.green.hex, 'icon' );
					await setIconColor( editor, displayState.active, colors.blue.hex, 'icon' );
				} );
				await test.step( 'capture screenshot', async () => {
					// Act
					nestedAccordionItem.first().click();
					await nestedAccordionItemContent.first().waitFor( { state: 'visible' } );
					nestedAccordionItem.nth( 2 ).hover();

					// Assert
					await expect( nestedAccordion ).toHaveScreenshot( 'header-style-editor.png' );
				} );
			} );

			await test.step( 'Frontend', async () => {
				// Act
				await editor.publishAndViewPage();
				nestedAccordionItemFront.first().click();
				nestedAccordionItemFront.nth( 2 ).hover();
				await page.waitForLoadState( 'networkidle' );

				// Assert
				await expect( nestedAccordionWidgetFront ).toHaveScreenshot( 'header-style-front.png' );
			} );
		} );

		test( 'Header style tests new', async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.openNewPage(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				frame = editor.getPreviewFrame(),
				nestedAccordionItem = await frame.locator( '.e-n-accordion-item' ),
				nestedAccordionWidgetFront = await page.locator( '.e-n-accordion' ),
				nestedAccordionItemFront = await nestedAccordionWidgetFront.locator( '.e-n-accordion-item' );

			await editor.closeNavigatorIfOpen();
			await editor.activatePanelTab( 'style' );
			await editor.openSection( 'section_header_style' );

			await test.step( 'Editor', async () => {
				await test.step( 'Add stroke and text-shadow styling to header', async () => {
					// Act
					await editor.setShadowControl( 'title-normal-text-shadow', 'text' );
					await editor.setTextStokeControl( 'title-normal-stroke', 'text', 2, colors.red.hex );

					await editor.selectStateTab( 'header_title_color_style', 'hover' );

					await editor.setShadowControl( 'title-hover-text-shadow', 'text' );
					await editor.setTextStokeControl( 'title-hover-stroke', 'text', 5, colors.blue.hex );

					await editor.selectStateTab( 'header_title_color_style', 'active' );

					await editor.setShadowControl( 'title-active-text-shadow', 'text' );
					await editor.setTextStokeControl( 'title-active-stroke', 'text', 1, colors.orange.hex );

					await nestedAccordionItem.nth( 0 ).hover();

					// Assert
					await expect.soft( await page.locator( '.elementor-widget-n-accordion' ).screenshot( { type: 'png' } ) ).toMatchSnapshot( 'nested-accordion-stroke-and-text-shadow.png' );
				} );
			} );

			await test.step( 'Frontend', async () => {
				await test.step( 'Test stroke and text-shadow styling', async () => {
					// Act
					await editor.publishAndViewPage();
					await page.hover( page.locator( '.e-n-accordion-item' ).nth( 1 ) );

					// Assert
					await expect.soft( await page.locator( '.elementor-widget-n-accordion' ).screenshot( { type: 'png' } ) ).toMatchSnapshot( 'nested-accordion-stroke-and-text-shadow-front.png' );

				} );
			} );
		} );
	} );
} );

/*
 * Returns the Icon from Nested Accordion Item.
 * @param nestedAccordionItem - Nested Accordion Item
 * @param iconIndex - index of the icon 0 or 1
 */
async function getIcon( nestedAccordionItem, iconIndex ) {
	return await nestedAccordionItem.locator( 'i' ).nth( iconIndex );
}

/**
 * Set Nested Accordion Title Tag (H1-H6,div,span,p)
 *
 * @param {string} optionToSelect          - value of select option i.e. h1,h2,h3,h4,h5,h6,div,span,p
 * @param {string} nestedAccordionWidgetId - id of the nested accordion widget
 * @param {Object} editor
 * @param {Object} page
 * @return {Promise<void>}
 */
async function setTitleTextTag( optionToSelect, nestedAccordionWidgetId, editor, page ) {
	const frame = editor.getPreviewFrame();
	await editor.selectElement( nestedAccordionWidgetId );
	await page.selectOption( '.elementor-control-title_tag .elementor-control-input-wrapper > select', optionToSelect );
	await frame.waitForLoadState( 'load' );
}

/**
 * Take a Screenshot of this Widget
 *
 * @param {string} fileName
 * @param {Object} widgetLocator
 * @param {number} quality
 * @return {Promise<void>}
 */
async function screenshotWidget( fileName, widgetLocator, quality = 90 ) {
	expect( await widgetLocator.screenshot( {
		type: 'jpeg',
		quality,
	} ) ).toMatchSnapshot( fileName );
}

async function setBorderAndBackground( editor, state, color, borderType, borderColor ) {
	await setState();
	await setBackgroundColor();
	await setBorderType();
	await setBorderWidth();
	await setBorderColor();

	async function setBackgroundColor() {
		await editor.page.locator( '.elementor-control-accordion_background_' + state + '_background .eicon-paint-brush' ).click();
		await editor.setColorControlValue( color, 'accordion_background_' + state + '_color' );
	}

	async function setBorderType() {
		await editor.page.selectOption( '.elementor-control-accordion_border_' + state + '_border >> select', { value: borderType } );
	}

	async function setBorderWidth() {
		await editor.page.locator( '.elementor-control-accordion_border_' + state + '_width [data-setting="top"]' ).fill( '5' );
	}

	async function setBorderColor() {
		await editor.setColorControlValue( borderColor, 'accordion_border_' + state + '_color' );
	}

	async function setState() {
		await editor.page.click( '.elementor-control-accordion_' + state + '_border_and_background' );
	}
}
async function setIconColor( editor, state, color, context ) {
	await setState();
	await setColor();

	async function setColor() {
		await editor.setColorControlValue( color, state + '_' + context + '_color' );
	}

	async function setState() {
		await editor.page.click( '.elementor-control-header_' + state + '_' + context );
	}
}
