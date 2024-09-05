import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import widgets from '../../../enums/widgets';
import EditorSelectors from '../../../selectors/editor-selectors';
import _path from 'path';

const templateFilePath = _path.resolve( __dirname, `../../templates/container-dimensions-ltr-rtl.json` );

test.describe( 'Container tests @container', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			container: true,
			container_grid: true,
			e_nested_atomic_repeaters: true,
			'nested-elements': true,
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

	test( 'Container no horizontal scroll', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		// Arrange.
		const editor = await wpAdmin.openNewPage(),
			containerSelector = '.elementor-element-edit-mode',
			frame = editor.getPreviewFrame();

		await editor.addElement( { elType: 'container' }, 'document' );
		// Set row direction.
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );

		// Evaluate scroll widths in the browser context.
		const hasNoHorizontalScroll = await frame.evaluate( ( selector ) => {
			const container = document.querySelector( selector );
			return container.scrollWidth <= container.clientWidth;
		}, containerSelector );

		// Check for no horizontal scroll.
		expect.soft( hasNoHorizontalScroll ).toBe( true );
	} );

	test( 'Convert to container does not show when only containers are on the page', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const hasTopBar = await editor.hasTopBar();
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );

		await editor.addWidget( widgets.button, containerId );

		if ( hasTopBar ) {
			await editor.publishPage();
			await page.locator( EditorSelectors.panels.topBar.wrapper + ' button[disabled]', { hasText: 'Publish' } ).waitFor();
		} else {
			await page.locator( '#elementor-panel-saver-button-publish-label' ).click();
			await page.waitForSelector( '#elementor-panel-saver-button-publish.elementor-disabled', { state: 'visible' } );
		}

		await page.reload();
		await editor.waitForPanelToLoad();

		await editor.openPageSettingsPanel();

		expect.soft( await page.locator( '.elementor-control-convert_to_container' ).count() ).toBe( 0 );
	} );

	test( 'Test spacer inside of the container', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame(),
			spacerSize = '200',
			defaultSpacerSize = '50';

		await test.step( 'Column container, spacer default size', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );

			await editor.addElement( { widgetType: widgets.spacer, elType: 'widget' }, container );
			await editor.addWidget( widgets.image, container );

			const spacerElementHeight = await frame.locator( '.elementor-widget-spacer' ).evaluate( ( node ) => node.clientHeight );

			expect.soft( String( spacerElementHeight ) ).toBe( defaultSpacerSize );
			await editor.removeElement( container );
		} );

		await test.step( 'Row container, spacer default size', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );

			// Set row direction.
			await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );
			await editor.addElement( { widgetType: widgets.spacer, elType: 'widget' }, container );
			await editor.addWidget( widgets.image, container );

			const spacerElementWidth = await frame.locator( '.elementor-widget-spacer' ).evaluate( ( node ) => node.clientWidth );

			expect.soft( String( spacerElementWidth ) ).toBe( defaultSpacerSize );
			await editor.removeElement( container );
		} );

		await test.step( 'Spacer added and container set to column', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' ),
				spacer = await editor.addElement( { widgetType: widgets.spacer, elType: 'widget' }, container );

			await editor.addWidget( widgets.image, container );
			await editor.selectElement( spacer );
			await editor.setSliderControlValue( 'space', spacerSize );

			const spacerElementHeight = await frame.locator( '.elementor-widget-spacer' ).evaluate( ( node ) => node.clientHeight );

			expect.soft( String( spacerElementHeight ) ).toBe( spacerSize );
			await editor.removeElement( container );
		} );

		await test.step( 'Container set to column and then Spacer added', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );

			await editor.selectElement( container );

			// Set column direction.
			await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-down' );

			const spacer = await editor.addElement( { widgetType: widgets.spacer, elType: 'widget' }, container );

			await editor.addWidget( widgets.image, container );
			await editor.selectElement( spacer );
			await editor.setSliderControlValue( 'space', spacerSize );

			const spacerElementHeight = await frame.locator( '.elementor-widget-spacer' ).evaluate( ( node ) => node.clientHeight );

			expect.soft( String( spacerElementHeight ) ).toBe( spacerSize );
			await editor.removeElement( container );
		} );

		await test.step( 'Spacer added and container set to row', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' ),
				spacer = await editor.addElement( { widgetType: widgets.spacer, elType: 'widget' }, container );

			await editor.addWidget( widgets.image, container );
			await editor.selectElement( spacer );
			await editor.setSliderControlValue( 'space', spacerSize );

			await editor.selectElement( container );

			// Set row direction.
			await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );

			const spacerElementWidth = await frame.locator( '.elementor-widget-spacer' ).evaluate( ( node ) => node.clientWidth );

			expect.soft( String( spacerElementWidth ) ).toBe( spacerSize );
			await editor.removeElement( container );
		} );

		await test.step( 'Container set to row and then Spacer added', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );

			await editor.selectElement( container );

			// Set row direction.
			await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );

			const spacer = await editor.addElement( { widgetType: widgets.spacer, elType: 'widget' }, container );

			await editor.addWidget( widgets.image, container );
			await editor.selectElement( spacer );
			await editor.setSliderControlValue( 'space', spacerSize );

			const spacerElementHeight = await frame.locator( '.elementor-widget-spacer' ).evaluate( ( node ) => node.clientWidth );

			expect.soft( String( spacerElementHeight ) ).toBe( spacerSize );
			await editor.removeElement( container );
		} );
	} );

	test( 'Gaps Control test - Check that control placeholder', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		await editor.addElement( { elType: 'container' }, 'document' );

		const desktopGapControlColumnInput = page.locator( '.elementor-control-flex_gap input[data-setting="column"]' ),
			tabletGapControlColumnInput = page.locator( '.elementor-control-flex_gap_tablet input[data-setting="column"]' ),
			mobileGapControlColumnInput = page.locator( '.elementor-control-flex_gap_mobile input[data-setting="column"]' );

		await test.step( 'Check the control initial placeholder', async () => {
			const gapControlPlaceholder = await desktopGapControlColumnInput.getAttribute( 'placeholder' );
			expect( gapControlPlaceholder ).toBe( '20' );
			expect( gapControlPlaceholder ).not.toBe( '[object, object]' );
		} );

		await test.step( 'Check the control placeholder inheritance from desktop to tablet after value change', async () => {
			await desktopGapControlColumnInput.fill( '50' );
			await editor.changeResponsiveView( 'tablet' );
			const gapControlPlaceholder = await tabletGapControlColumnInput.getAttribute( 'placeholder' );
			expect( gapControlPlaceholder ).toBe( '50' );
		} );

		await test.step( 'Check the control placeholder inheritance from tablet to mobile after value change', async () => {
			await tabletGapControlColumnInput.fill( '40' );
			await editor.changeResponsiveView( 'mobile' );
			const gapControlPlaceholder = await mobileGapControlColumnInput.getAttribute( 'placeholder' );
			expect( gapControlPlaceholder ).toBe( '40' );
		} );
	} );

	test( 'Test dimensions with logical properties using ltr & rtl', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		try {
			await wpAdmin.setSiteLanguage( 'he_IL' );

			let editor = await wpAdmin.openNewPage();
			let frame = editor.getPreviewFrame();

			await test.step( 'Load Template', async () => {
				await editor.loadTemplate( templateFilePath, false );
				await frame.waitForSelector( '.e-con.e-parent>>nth=0' );
				await editor.closeNavigatorIfOpen();
			} );

			await test.step( 'Rtl screenshot', async () => {
				await expect( page.locator( 'body' ) ).toHaveClass( /rtl/ );
				await expect( editor.getPreviewFrame().locator( 'body' ) ).toHaveClass( /rtl/ );

				await editor.togglePreviewMode();

				expect.soft( await editor.getPreviewFrame()
					.locator( '.e-con.e-parent>>nth=0' )
					.screenshot( { type: 'png' } ) )
					.toMatchSnapshot( 'container-dimensions-rtl.png' );
			} );

			await test.step( 'Set user language to English', async () => {
				await wpAdmin.setSiteLanguage( 'he_IL', '' );
			} );

			editor = await wpAdmin.openNewPage();
			frame = editor.getPreviewFrame();

			await test.step( 'Load Template', async () => {
				await editor.loadTemplate( templateFilePath, false );
				await frame.waitForSelector( '.e-con.e-parent >> nth=0' );
				await editor.closeNavigatorIfOpen();
			} );

			await test.step( 'Rtl screenshot with LTR UI', async () => {
				await expect( page.locator( 'body' ) ).not.toHaveClass( /rtl/ );
				await expect( editor.getPreviewFrame().locator( 'body' ) ).toHaveClass( /rtl/ );

				await editor.togglePreviewMode();

				await expect.soft( editor.getPreviewFrame()
					.locator( '.e-con.e-parent >> nth=0' ) )
					.toHaveScreenshot( 'container-dimensions-rtl-with-ltr-ui.png' );
			} );
		} finally {
			await wpAdmin.setSiteLanguage( '' );
		}

		const editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame();

		await test.step( 'Load Template', async () => {
			await editor.loadTemplate( templateFilePath, false );
			await frame.waitForSelector( '.e-con.e-parent>>nth=0' );
			await editor.closeNavigatorIfOpen();
		} );

		await test.step( 'Ltr screenshot', async () => {
			await expect( page.locator( 'body' ) ).not.toHaveClass( /rtl/ );
			await expect( editor.getPreviewFrame().locator( 'body' ) ).not.toHaveClass( /rtl/ );

			await editor.togglePreviewMode();

			await expect.soft( editor.getPreviewFrame()
				.locator( '.e-con.e-parent>>nth=0' ) )
				.toHaveScreenshot( 'container-dimensions-ltr.png' );
		} );
	} );

	test( 'Test child containers default content widths', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		await test.step( '“Boxed” Parent container to default to "Full Width" content width on child container ', async () => {
			const parentContainer = await editor.addElement( { elType: 'container' }, 'document' );

			// Act.
			// Just in case it's not Boxed by default
			await editor.setSelectControlValue( 'content_width', 'boxed' );

			const childContainer = await editor.addElement( { elType: 'container' }, parentContainer );
			const nestedChildContainer1 = await editor.addElement( { elType: 'container' }, childContainer );
			const nestedChildContainer2 = await editor.addElement( { elType: 'container' }, nestedChildContainer1 );

			// Assert
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentContainer }` ) ).toHaveClass( /e-con-boxed/ );
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ childContainer }` ) ).toHaveClass( /e-con-full/ );
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ nestedChildContainer1 }` ) ).toHaveClass( /e-con-full/ );
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ nestedChildContainer2 }` ) ).toHaveClass( /e-con-full/ );
		} );

		await test.step( '“Full Width” Parent container to default to "Boxed" content width on child container', async () => {
			const parentContainer = await editor.addElement( { elType: 'container' }, 'document' );

			await editor.setSelectControlValue( 'content_width', 'full' );

			const childContainer = await editor.addElement( { elType: 'container' }, parentContainer );
			const nestedChildContainer1 = await editor.addElement( { elType: 'container' }, childContainer );
			const nestedChildContainer2 = await editor.addElement( { elType: 'container' }, nestedChildContainer1 );

			// Assert
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentContainer }` ) ).toHaveClass( /e-con-full/ );
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ childContainer }` ) ).toHaveClass( /e-con-boxed/ );
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ nestedChildContainer1 }` ) ).toHaveClass( /e-con-full/ );
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ nestedChildContainer2 }` ) ).toHaveClass( /e-con-full/ );
		} );
	} );

	test( 'Test animation style inside the container', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		await test.step( 'Add container with animation', async () => {
			await editor.addElement( { elType: 'container' }, 'document' );

			await editor.openPanelTab( 'advanced' );
			await editor.openSection( 'section_effects' );
			await editor.setSelect2ControlValue( 'animation', 'Bounce In' );

			await editor.publishAndViewPage();
		} );

		await test.step( 'Assert animation stylesheet on the frontend', async () => {
			await expect( page.locator( EditorSelectors.container ) ).toHaveCSS( 'animation-name', 'bounceIn' );
		} );
	} );
} );
