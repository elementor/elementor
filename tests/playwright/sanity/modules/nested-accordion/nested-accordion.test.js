import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { colors } from '../../../enums/colors';
import { borderStyle } from '../../../enums/border-styles';
import { displayState } from '../../../enums/display-states';

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
				await expect.soft( await accordionWrapper ).toHaveCount( 1 );
				await expect.soft( await toggleWrapper ).toHaveCount( 1 );
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
				await expect.soft( await nestedAccordion ).toHaveCount( 1 );
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
				// Arrange
				const addItemButton = await page.locator( '.elementor-repeater-add' ),
					numberOfTitles = await nestedAccordionItemTitle.count(),
					numberOfContents = await nestedAccordionItemContent.count();

				// Act
				await addItemButton.click();

				// Assert
				await expect.soft( nestedAccordionItemTitle ).toHaveCount( numberOfTitles + 1 );
				await expect.soft( nestedAccordionItemContent ).toHaveCount( numberOfContents + 1 );
			} );

			await test.step( 'Remove an item from the repeater', async () => {
				// Arrange
				const deleteItemButton = await page.locator( '.elementor-repeater-row-tool.elementor-repeater-tool-remove .eicon-close' ),
					numberOfTitles = await nestedAccordionItemTitle.count(),
					numberOfContents = await nestedAccordionItemContent.count();

				// Act
				await deleteItemButton.last().click();

				// Assert
				await expect.soft( nestedAccordionItemTitle ).toHaveCount( numberOfTitles - 1 );
				await expect.soft( nestedAccordionItemContent ).toHaveCount( numberOfContents - 1 );
			} );

			await test.step( 'Duplicate an item to the repeater', async () => {
				// Arrange
				const duplicateButton = await page.locator( '.elementor-repeater-tool-duplicate .eicon-copy' ).first(),
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

				expect.soft( itemVisibilityBeforeAnimation ).toEqual( true );

				await frame.locator( '.e-n-accordion-item:first-child > .e-n-accordion-item-title' ).click();

				// Wait for the closing animation to complete
				await page.waitForTimeout( animationDuration );

				// Check the computed height
				const maxHeightAfterClose = await frame.locator( '.e-n-accordion-item:first-child > .e-con' ).evaluate( ( element ) =>
					window.getComputedStyle( element ).getPropertyValue( 'height' ),
				);

				expect.soft( maxHeightAfterClose ).toEqual( '0px' );
			} );

			await test.step( 'Check open animation', async () => {
				const itemVisibilityBeforeAnimation = await frame.isVisible( '.e-n-accordion-item:first-child > .e-con' );

				expect.soft( itemVisibilityBeforeAnimation ).toEqual( false );

				await frame.locator( '.e-n-accordion-item:first-child > .e-n-accordion-item-title' ).click();

				// Wait for the open animation to complete
				await page.waitForTimeout( animationDuration );

				// Check the computed height
				const maxHeightAfterOpen = await frame.locator( '.e-n-accordion-item:first-child > .e-con' ).evaluate( ( element ) =>
					window.getComputedStyle( element ).getPropertyValue( 'height' ),
				);

				expect.soft( maxHeightAfterOpen ).not.toEqual( '0px' );
			} );
		} );

		test( 'Nested Accordion Visual Regression Test', async ( { browser }, testInfo ) => {
			// Act
			const page = await browser.newPage(),
				wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.useElementorCleanPost(),
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

		test( 'Nested Accordion test SVG Icon and No Icon', async ( { browser }, testInfo ) => {
			const page = await browser.newPage(),
				wpAdmin = new WpAdminPage( page, testInfo ),
				nestedAccordionWidgetId = '48f02ad';

			await wpAdmin.enableAdvancedUploads();
			const editor = await wpAdmin.useElementorCleanPost();
			let	frame = editor.getPreviewFrame();

			await editor.loadJsonPageTemplate( __dirname, 'nested-accordion-title-and-icons', '.elementor-widget-n-accordion' );
			await editor.closeNavigatorIfOpen();

			await test.step( 'Check that an SVG title icon is displayed', async () => {
				await editor.selectElement( nestedAccordionWidgetId );
				await page.locator( '.elementor-control-icons--inline__svg' ).first().click();
				const editorTitleIcons = frame.locator( '.e-n-accordion-item-title-icon' );

				await editor.uploadSVG();

				await test.step( 'Check that SVG icon is displayed in the editor', async () => {
					// Default icon is tested in Element Regression Screenshot Test
					// Expect default icon to be displayed in preview frame & front end
					await expect.soft( editorTitleIcons ).toHaveCount( 3 ); // Item Title Icon wrapper is displayed in Editor when SVG icon is selected
					await expect.soft( editorTitleIcons.locator( '.e-closed svg' ) ).toHaveCount( 3 ); // SVG Icon
				} );

				await test.step( 'Check that SVG icon is displayed in the front end', async () => {
					await editor.publishAndViewPage();
					const titleIcons = page.locator( '.e-n-accordion-item-title-icon' );

					await expect.soft( titleIcons ).toHaveCount( 3 ); //  Item Title Icon wrapper is displayed in Editor when SVG icon is selected
					await expect.soft( page.locator( '.e-n-accordion-item-title-icon .e-closed svg' ) ).toHaveCount( 3 ); // SVG Icon
				} );
			} );

			await test.step( 'Check that No Icon container is displayed with Title Icons disabled', async () => {
				await editor.gotoPostId( 1 ); // EditPage
				await editor.selectElement( nestedAccordionWidgetId );
				await page.locator( '.elementor-control-inline-icon .elementor-control-icons--inline__none' ).first().click();

				frame = editor.getPreviewFrame();
				const editorFirstItem = frame.locator( '.e-n-accordion-item' ).first();

				await test.step( 'Expect no icon or .e-n-accordion-item-title-icon wrapper to be displayed in preview frame', async () => {
					await editor.isUiStable( editorFirstItem );
					await expectScreenshotToMatchLocator( 'nested-accordion-no-icons.png', editorFirstItem );
				} );

				await test.step( 'Expect no icon or .e-n-accordion-item-title-icon wrapper to be displayed in front end', async () => {
					await editor.publishAndViewPage();
					const firstItem = page.locator( '.e-n-accordion-item' ).first();
					await editor.isUiStable( firstItem );
					await expectScreenshotToMatchLocator( 'nested-accordion-fe-no-icons.png', firstItem );
				} );
			} );

			await test.step( 'Disable Advanced Uploads', async () => {
				await wpAdmin.disableAdvancedUploads();
			} );
		} );

		test( 'Nested Accordion Title, Text and Icon Position', async ( { browser }, testInfo ) => {
			// Act
			const page = await browser.newPage(),
				wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.useElementorCleanPost();

			await editor.loadJsonPageTemplate( __dirname, 'nested-accordion-title-and-icons', '.elementor-widget-n-accordion' );

			await editor.closeNavigatorIfOpen();

			const nestedAccordionWidgetId = '48f02ad',
				frame = editor.getPreviewFrame(),
				nestedAccordionTitle = frame.locator( '.e-n-accordion-item-title' ).first();

			await test.step( 'If Accordion is open fa-minus is displayed', async () => {
				// Assert
				await expect.soft( await nestedAccordionTitle.locator( '.e-opened' ).locator( 'i' ) ).toHaveClass( 'fas fa-minus' );
				await expect.soft( await nestedAccordionTitle.locator( '.e-opened' ) ).toBeVisible();
				await expect.soft( await nestedAccordionTitle.locator( '.e-closed' ) ).toBeHidden();
			} );

			await test.step( 'If Accordion is closed fa-plus is displayed & fa-minus icon is hidden', async () => {
				await nestedAccordionTitle.click();
				await editor.isUiStable( nestedAccordionTitle, 3, 1000 );
				await expect.soft( await nestedAccordionTitle.locator( '.e-closed' ).locator( 'i' ) ).toHaveClass( 'fas fa-plus' );
				await expect.soft( await nestedAccordionTitle.locator( '.e-closed' ) ).toBeVisible();
				await expect.soft( await nestedAccordionTitle.locator( '.e-opened' ) ).toBeHidden();
				await editor.isUiStable( nestedAccordionTitle, 3, 1500 );
				await nestedAccordionTitle.click();
			} );

			await editor.selectElement( nestedAccordionWidgetId );

			await test.step( 'Check title position default start', async () => {
				await editor.selectElement( nestedAccordionWidgetId );
				// Assert
				// normal = Flex-start
				await expect.soft( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'normal' );

				await setTitleHorizontalAlignment( 'start', editor );
				await editor.isUiStable( nestedAccordionTitle, 3 );
				await expect.soft( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'normal' );
			} );

			await test.step( 'Check title position end', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await setTitleHorizontalAlignment( 'end', editor );
				// Assert
				await editor.isUiStable( nestedAccordionTitle, 3 );
				await expect.soft( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'flex-end' );
			} );

			await test.step( 'Check title position center', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await setTitleHorizontalAlignment( 'center', editor );
				// Assert
				await editor.isUiStable( nestedAccordionTitle, 3 );
				await expect.soft( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'center' );
			} );

			await test.step( 'Check title position justify', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await setTitleHorizontalAlignment( 'stretch', editor );
				// Assert
				await editor.isUiStable( nestedAccordionTitle, 3 );
				await expect.soft( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'space-between' );
			} );

			await test.step( 'Check title icon position left', async () => {
				// Assert
				await expect.soft( nestedAccordionTitle.locator( '.e-n-accordion-item-title-icon' ) ).toHaveCSS( 'order', '-1' );
			} );

			await test.step( 'Check title icon position right', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await setTitleIconPosition( 'right', editor );
				// Assert
				await editor.isUiStable( nestedAccordionTitle, 3 );
				await expect.soft( nestedAccordionTitle.locator( '.e-n-accordion-item-title-icon' ) ).toHaveCSS( 'order', '0' );
			} );

			await test.step( 'Change to mobile mode', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await page.getByText( 'Desktop Tablet Portrait Mobile Portrait' ).first().click();
				await page.getByRole( 'button', { name: 'Mobile Portrait' } ).first().click();
			} );

			await test.step( 'Mobile -Check that the title icon is displayed', async () => {
				// Assert
				await expect.soft( await nestedAccordionTitle.locator( '.e-opened' ).locator( 'i' ) ).toHaveClass( 'fas fa-minus' );
				await expect.soft( await nestedAccordionTitle.locator( '.e-opened' ) ).toBeVisible();
				await expect.soft( await nestedAccordionTitle.locator( '.e-closed' ) ).toBeHidden();
			} );

			await test.step( 'Mobile - Check that icon changes when the mobile Accordion is opened', async () => {
				await frame.waitForLoadState( 'load' );
				await nestedAccordionTitle.click();
				await expect.soft( await nestedAccordionTitle.locator( '.e-closed' ).locator( 'i' ) ).toHaveClass( 'fas fa-plus' );
				await expect.soft( await nestedAccordionTitle.locator( '.e-closed' ) ).toBeVisible();
				await expect.soft( await nestedAccordionTitle.locator( '.e-opened' ) ).toBeHidden();
				await nestedAccordionTitle.click();
			} );

			await test.step( 'Mobile - Check title position mobile is default start', async () => {
				// Assert
				await expect.soft( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'normal' );
			} );

			await test.step( 'Mobile - Check title position mobile is flex-end', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await setTitleHorizontalAlignment( 'end', editor, 'mobile' );
				// Assert
				await editor.isUiStable( nestedAccordionTitle, 3 );
				await expect.soft( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'flex-end' );
			} );

			await test.step( 'Mobile - Check title position mobile is center', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await setTitleHorizontalAlignment( 'center', editor, 'mobile' );
				// Assert
				await editor.isUiStable( nestedAccordionTitle, 3 );
				await expect.soft( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'center' );
			} );

			await test.step( 'Mobile - Check title position mobile is justify', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await setTitleHorizontalAlignment( 'stretch', editor, 'mobile' );
				// Assert
				await editor.isUiStable( nestedAccordionTitle, 3 );
				await expect.soft( nestedAccordionTitle ).toHaveCSS( 'justify-content', 'space-between' );
			} );

			await test.step( 'Mobile - Check title icon position right', async () => {
				// Assert
				await expect.soft( nestedAccordionTitle.locator( '.e-n-accordion-item-title-icon' ) ).toHaveCSS( 'order', '0' );
			} );

			await test.step( 'Mobile - Check title icon position left', async () => {
				// Act
				await editor.selectElement( nestedAccordionWidgetId );
				await setTitleIconPosition( 'left', editor, 'mobile' );
				// Assert
				await editor.isUiStable( nestedAccordionTitle, 3 );
				await expect.soft( nestedAccordionTitle.locator( '.e-n-accordion-item-title-icon' ) ).toHaveCSS( 'order', '-1' );
			} );
		} );

		test( 'Nested Accordion Title Icon and Text Vertical Alignment', async ( { browser }, testInfo ) => {
			const page = await browser.newPage(),
				wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.useElementorCleanPost(),
				frame = editor.getPreviewFrame(),
				nestedAccordionWidgetId = '48f02ad',
				nestedAccordionTitle = frame.locator( '.e-n-accordion-item-title' ).first();

			await editor.loadJsonPageTemplate( __dirname, 'nested-accordion-title-and-icons', '.elementor-widget-n-accordion' );

			await editor.closeNavigatorIfOpen();

			await test.step( 'Check title <h1> text and icon  alignment', async () => {
				const tag = 'h1';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await expectScreenshotToMatchLocator( `nested-accordion-title-${ tag }-alignment.png`, nestedAccordionTitle );
			} );
			await test.step( 'Check title <h2> text and icon alignment', async () => {
				const tag = 'h2';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await expectScreenshotToMatchLocator( `nested-accordion-title-${ tag }-alignment.png`, nestedAccordionTitle );
			} );
			await test.step( 'Check title <h3> text and icon alignment', async () => {
				const tag = 'h3';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await expectScreenshotToMatchLocator( `nested-accordion-title-${ tag }-alignment.png`, nestedAccordionTitle );
			} );
			await test.step( 'Check title <h4> text and icon alignment', async () => {
				const tag = 'h4';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await expectScreenshotToMatchLocator( `nested-accordion-title-${ tag }-alignment.png`, nestedAccordionTitle );
			} );
			await test.step( 'Check title <h5> text and icon alignment', async () => {
				const tag = 'h5';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await expectScreenshotToMatchLocator( `nested-accordion-title-${ tag }-alignment.png`, nestedAccordionTitle );
			} );
			await test.step( 'Check title <h6> text and icon alignment', async () => {
				const tag = 'h6';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await expectScreenshotToMatchLocator( `nested-accordion-title-${ tag }-alignment.png`, nestedAccordionTitle );
			} );
			await test.step( 'Check title <p> text and icon alignment', async () => {
				const tag = 'p';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await expectScreenshotToMatchLocator( `nested-accordion-title-${ tag }-alignment.png`, nestedAccordionTitle );
			} );
			await test.step( 'Check title <span> text and icon alignment', async () => {
				const tag = 'span';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await expectScreenshotToMatchLocator( `nested-accordion-title-${ tag }-alignment.png`, nestedAccordionTitle );
			} );
			await test.step( 'Check title <div> text and icon alignment', async () => {
				const tag = 'div';
				await frame.waitForLoadState( 'load' );
				await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
				// Assert
				await expectScreenshotToMatchLocator( `nested-accordion-title-${ tag }-alignment.png`, nestedAccordionTitle );
			} );
		} );

		test( 'Accordion style tests', async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.openNewPage(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				frame = editor.getPreviewFrame(),
				nestedAccordionItem = await frame.locator( '.e-n-accordion-item' ),
				nestedAccordionItemTitle = await frame.locator( '.e-n-accordion-item-title' ),
				nestedAccordionWidgetFront = await page.locator( '.e-n-accordion' ),
				nestedAccordionItemTitleFront = await nestedAccordionWidgetFront.locator( '.e-n-accordion-item-title' );

			let nestedAccordionID;

			await test.step( 'Editor', async () => {
				// Add Widget and navigate to Style Tab
				await editor.closeNavigatorIfOpen();
				nestedAccordionID = await editor.addWidget( 'nested-accordion', container );
				await nestedAccordionItem.first().click();
				const nestedAccordion = await editor.selectElement( nestedAccordionID );
				await editor.activatePanelTab( 'style' );
				await editor.openSection( 'section_accordion_style' );

				await editor.setSliderControlValue( 'accordion_item_title_space_between', '15' );
				await editor.setSliderControlValue( 'accordion_item_title_distance_from_content', '5' );
				await setBorderAndBackground( editor, 'normal', colors.red.hex, borderStyle.solid, colors.green.hex );
				await setBorderAndBackground( editor, 'hover', colors.green.hex, borderStyle.dashed, colors.blue.hex );
				await setBorderAndBackground( editor, 'active', colors.blue.hex, borderStyle.dotted, colors.red.hex );
				await editor.setDimensionsValue( 'accordion_border_radius', '25' );
				await editor.setDimensionsValue( 'accordion_padding', '10' );
				await nestedAccordionItemTitle.nth( 2 ).hover();
				await expectScreenshotToMatchLocator( 'accordion-style-editor.png', nestedAccordion );
			} );

			await test.step( 'Frontend', async () => {
				// Act
				await editor.publishAndViewPage();

				// Act
				await nestedAccordionItemTitleFront.nth( 2 ).hover();
				await expectScreenshotToMatchLocator( 'accordion-style-front.png', nestedAccordionWidgetFront );
			} );
		} );

		test( 'Content style tests', async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.openNewPage(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				frame = editor.getPreviewFrame(),
				nestedAccordionItemTitle = await frame.locator( '.e-n-accordion-item' ),
				nestedAccordionItemContent = nestedAccordionItemTitle.locator( '.e-con' );

			await editor.closeNavigatorIfOpen();
			const nestedAccordionID = await editor.addWidget( 'nested-accordion', container );
			const nestedAccordion = await editor.selectElement( nestedAccordionID );

			await editor.openSection( 'section_interactions' );
			await editor.setSelectControlValue( 'max_items_expended', 'multiple' );

			await test.step( 'open accordion', async () => {
				for ( let i = 1; i < await nestedAccordionItemContent.count(); i++ ) {
					await nestedAccordionItemTitle.nth( i ).click();
					await nestedAccordionItemContent.nth( i ).waitFor( { state: 'visible' } );
				}
			} );

			await editor.activatePanelTab( 'style' );
			await editor.openSection( 'section_content_style' );

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
				await editor.isUiStable( nestedAccordion );
				await expectScreenshotToMatchLocator( 'nested-Accordion-content-style.png', nestedAccordion );
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
					await editor.isUiStable( nestedAccordion );
					await expectScreenshotToMatchLocator( 'nested-Accordion-content-style-override.png', nestedAccordion );
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
					await page.waitForTimeout( 1000 );

					// Assert.
					await editor.isUiStable( nestedAccordionWidgetFront );
					await expectScreenshotToMatchLocator( 'nested-Accordion-content-style-front.png', nestedAccordionWidgetFront );
				} );
			} );
		} );

		test( 'Header style tests', async ( { page }, testInfo ) => {
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
					await nestedAccordionItem.first().click();
					await nestedAccordionItemContent.first().waitFor( { state: 'visible' } );
					await nestedAccordionItem.nth( 2 ).hover();

					// Assert
					await expectScreenshotToMatchLocator( 'header-style-editor.png', nestedAccordion );
				} );
			} );

			await test.step( 'Frontend', async () => {
				// Act
				await editor.publishAndViewPage();
				await nestedAccordionItemFront.first().click();
				await nestedAccordionItemFront.nth( 2 ).hover();
				await page.waitForLoadState( 'networkidle' );

				// Assert
				await expectScreenshotToMatchLocator( 'header-style-front.png', nestedAccordionWidgetFront );
			} );
		} );
	} );
} );

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
 * @param {Object} locator
 * @return {Promise<void>}
 */
async function expectScreenshotToMatchLocator( fileName, locator ) {
	expect.soft( await locator.screenshot( {
		type: 'png',
	} ) ).toMatchSnapshot( fileName );
}

async function getChoicesButtonSelector( choicesControlId, icon ) {
	return '.elementor-control-accordion_' + choicesControlId + ' ' + icon;
}

async function setTitleIconPosition( direction, editor, breakpoint = 'desktop' ) {
	const icon = Object.freeze( {
		right: '.eicon-h-align-right',
		left: '.eicon-h-align-left',
	} );

	const controlBreakpoint = ( breakpoint.toLowerCase() !== 'desktop' ) ? '_' + breakpoint : '';
	const locator = await getChoicesButtonSelector( 'item_title_icon_position' + controlBreakpoint, icon[ direction ] );
	await editor.page.locator( locator ).click();
}
async function setTitleHorizontalAlignment( direction, editor, breakpoint = 'desktop' ) {
	const icon = Object.freeze( {
		start: '.eicon-align-start-h',
		end: '.eicon-align-end-h',
		center: '.eicon-h-align-center',
		stretch: '.eicon-h-align-stretch',
		justify: '.eicon-h-align-stretch',
	} );

	const controlBreakpoint = ( breakpoint.toLowerCase() !== 'desktop' ) ? '_' + breakpoint : '';
	const locator = await getChoicesButtonSelector( 'item_title_position_horizontal' + controlBreakpoint, icon[ direction ] );
	await editor.page.locator( locator ).click();
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
