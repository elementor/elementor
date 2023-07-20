import { expect, test } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { colors } from '../../../enums/colors';
import { borderStyle } from '../../../enums/border-styles';
import { displayState } from '../../../enums/display-states';
import { expectScreenshotToMatchLocator, setBorderAndBackground, setIconColor } from './helper';

test.describe( 'Nested Accordion Style Tests @nested-accordion', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = await new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: 'active',
			'nested-elements': 'active',
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

		await test.step( 'Open accordion', async () => {
			for ( let i = 1; i < await nestedAccordionItemContent.count(); i++ ) {
				await nestedAccordionItemTitle.nth( i ).click();
				await nestedAccordionItemContent.nth( i ).waitFor( { state: 'visible' } );
			}
		} );

		await editor.activatePanelTab( 'style' );
		await editor.openSection( 'section_content_style' );

		await test.step( 'Set background', async () => {
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

		await test.step( 'Set padding', async () => {
			// Act
			await editor.setDimensionsValue( 'content_padding', '50' );
		} );

		await test.step( 'Compare editor images', async () => {
			await editor.isUiStable( nestedAccordion );
			await expectScreenshotToMatchLocator( 'nested-Accordion-content-style.png', nestedAccordion );
		} );

		await test.step( 'Container\'s style should override item\'s style', async () => {
			await test.step( 'Open container settings', async () => {
				// Act
				await nestedAccordionItemContent.first().hover();
				await nestedAccordionItemTitle.first().locator( '.elementor-editor-container-settings' ).click();
			} );

			await test.step( 'Override background and border', async () => {
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

			await test.step( 'Override padding', async () => {
				// Act
				await editor.activatePanelTab( 'advanced' );
				await editor.setDimensionsValue( 'padding', '22' );
			} );

			await test.step( 'Compare container override', async () => {
				await editor.isUiStable( nestedAccordion );
				await expectScreenshotToMatchLocator( 'nested-Accordion-content-style-override.png', nestedAccordion );
			} );

			await test.step( 'Compare frontend', async () => {
				// Act
				await editor.publishAndViewPage();
				const nestedAccordionWidgetFront = await page.locator( '.e-n-accordion' ),
					nestedAccordionItemTitleFront = await nestedAccordionWidgetFront.locator( '.e-n-accordion-item-title' );

				await test.step( 'Open accordion', async () => {
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
			container = await editor.addElement( { elType: 'container' }, 'document' );
		let frame = editor.getPreviewFrame(),
			nestedAccordionItem = await frame.locator( '.e-n-accordion-item' ),
			nestedAccordionWidgetFront = await page.locator( '.e-n-accordion' ),
			nestedAccordionItemText = await frame.locator( '.e-n-accordion-item-title-text' );
		const nestedAccordionItemFront = await nestedAccordionWidgetFront.locator( '.e-n-accordion-item' ),
			nestedAccordionItemContent = nestedAccordionItem.locator( '.e-con' ),
			nestedAccordionItemFrontText = await page.locator( '.e-n-accordion-item-title-text' ),
			pageId = await editor.getPageId();

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

			await test.step( 'Set header style', async () => {
				// Act
				await editor.setTypography( 'title_typography', '70' );
				await editor.setSliderControlValue( 'icon_size', '70' );
				await editor.setSliderControlValue( 'icon_spacing', '70' );
				await setIconColor( editor, displayState.normal, colors.green.hex, 'title' );
				await setIconColor( editor, displayState.hover, colors.blue.hex, 'title' );
				await setIconColor( editor, displayState.active, colors.red.hex, 'title' );
				await setIconColor( editor, displayState.normal, colors.red.hex, 'icon' );
				await setIconColor( editor, displayState.hover, colors.green.hex, 'icon' );
				await setIconColor( editor, displayState.active, colors.blue.hex, 'icon' );
			} );

			await test.step( 'Capture screenshot', async () => {
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
			await editor.gotoPostId( pageId );
		} );

		await test.step( 'Headers Stroke and Text-Shadow', async () => {
			await editor.gotoPostId( pageId );
			frame = editor.getPreviewFrame();
			// Remove and add a new widget to reset the style
			await editor.removeElement( nestedAccordionID );
			nestedAccordionID = await editor.addWidget( 'nested-accordion', container );
			nestedAccordion = await frame.locator( '.elementor-widget-n-accordion' );
			nestedAccordionItem = await frame.locator( '.e-n-accordion-item' );

			await test.step( 'Add stroke and text-shadow styling to header - Editor', async () => {
				// Act
				await editor.activatePanelTab( 'style' );
				await editor.openSection( 'section_header_style' );

				await editor.setShadowControl( 'title_normal_text_shadow', 'text' );
				await editor.setTextStokeControl( 'title_normal_stroke', 'text', 2, colors.red.hex );

				await editor.selectStateTab( 'header_title_color_style', 'hover' );

				await editor.setShadowControl( 'title_hover_text_shadow', 'text' );
				await editor.setTextStokeControl( 'title_hover_stroke', 'text', 5, colors.blue.hex );

				await editor.selectStateTab( 'header_title_color_style', 'active' );

				await editor.setShadowControl( 'title_active_text_shadow', 'text' );
				await editor.setTextStokeControl( 'title_active_stroke', 'text', 1, colors.orange.hex );

				// Assert
				await editor.isUiStable( nestedAccordion );
				await expectScreenshotToMatchLocator( 'nested-accordion-stroke-and-text-shadow.png', nestedAccordion );
			} );

			await test.step( 'Check stroke and text-shadow Hover styling - Editor', async () => {
				nestedAccordionItemText = await frame.locator( '.e-n-accordion-item-title-text' );
				await nestedAccordionItem.nth( 1 ).hover();
				await expect.soft( nestedAccordionItemText.nth( 1 ) ).toHaveCSS( 'text-shadow', 'rgba(0, 0, 0, 0.3) 0px 0px 10px' );
				await expect.soft( nestedAccordionItemText.nth( 1 ) ).toHaveCSS( 'stroke', colors.blue.rgb );
				await expect.soft( nestedAccordionItemText.nth( 1 ) ).toHaveCSS( 'stroke-width', '5px' );
			} );

			await test.step( 'Test stroke and text-shadow styling - Frontend', async () => {
				// Act
				await editor.publishAndViewPage();
				nestedAccordionWidgetFront = await page.locator( '.e-n-accordion' );
				// Assert
				await expectScreenshotToMatchLocator( 'nested-accordion-stroke-and-text-shadow-front.png', nestedAccordionWidgetFront );
				// Await expect.soft( await page.locator( '.elementor-widget-n-accordion' ).screenshot( { type: 'png' } ) ).toMatchSnapshot( 'nested-accordion-stroke-and-text-shadow-front.png' );
			} );

			await test.step( 'Check stroke and text-shadow Hover styling - Frontend', async () => {
				// Act
				nestedAccordionItemText = await frame.locator( '.e-n-accordion-item-title-text' );
				await nestedAccordionItemFront.nth( 1 ).hover();

				// Assert
				await expect.soft( nestedAccordionItemFrontText.nth( 1 ) ).toHaveCSS( 'text-shadow', 'rgba(0, 0, 0, 0.3) 0px 0px 10px' );
				await expect.soft( nestedAccordionItemFrontText.nth( 1 ) ).toHaveCSS( 'stroke', colors.blue.rgb );
				await expect.soft( nestedAccordionItemFrontText.nth( 1 ) ).toHaveCSS( 'stroke-width', '5px' );
			} );
		} );
	} );
} );
