import { expect, Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import widgets from '../../../enums/widgets';
import Breakpoints from '../../../assets/breakpoints';
import EditorPage from '../../../pages/editor-page';
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

	test( 'Justify icons are displayed correctly', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const breakpoints = Breakpoints.getBasic().reverse();
		const directions = [ 'right', 'down', 'left', 'up' ];
		const editor = await wpAdmin.openNewPage();
		await editor.addElement( { elType: 'container' }, 'document' );
		await testJustifyDirections( directions, breakpoints, editor, page, 'ltr' );
	} );

	test( 'Justify icons are displayed correctly for RTL', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const breakpoints = Breakpoints.getBasic().reverse();
		const directions = [ 'right', 'down', 'left', 'up' ];

		try {
			await wpAdmin.setSiteLanguage( 'he_IL' );
			const editor = await wpAdmin.openNewPage();
			await editor.addElement( { elType: 'container' }, 'document' );
			await testJustifyDirections( directions, breakpoints, editor, page, 'rtl' );
		} finally {
			await wpAdmin.setSiteLanguage( '' );
		}
	} );

	test( 'Widgets are not editable in preview mode', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Set row direction.
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );

		// Add widgets.
		await editor.addWidget( widgets.button, container );
		await editor.addWidget( widgets.heading, container );
		await editor.addWidget( widgets.image, container );

		const preview = editor.getPreviewFrame();

		const resizers = preview.locator( '.ui-resizable-handle.ui-resizable-e' );
		await expect.soft( resizers ).toHaveCount( 4 );

		await editor.togglePreviewMode();
		await expect.soft( resizers ).toHaveCount( 0 );
	} );

	test( 'Test grid container controls', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			containers = [
				{ setting: 'start', id: '' },
				{ setting: 'center', id: '' },
				{ setting: 'end', id: '' },
				{ setting: 'stretch', id: '' },
			];

		await editor.closeNavigatorIfOpen();

		// Add containers and set various controls.
		for ( const [ index, container ] of Object.entries( containers ) ) {
			// Add container.
			containers[ index ].id = await editor.addElement( { elType: 'container' }, 'document' );

			// Set various controls
			await editor.setSelectControlValue( 'container_type', 'grid' );
			const clickOptions = { position: { x: 0, y: 0 } }; // This is to avoid the "tipsy" alt info that can block the click of the next item.
			await page.locator( `.elementor-control-grid_justify_items .eicon-align-${ container.setting }-h` ).click( clickOptions );
			await page.locator( `.elementor-control-grid_align_items .eicon-align-${ container.setting }-v` ).click( clickOptions );
		}

		// Assert.
		// Check container settings are set as expected in the editor.
		for ( const container of containers ) {
			const element = editor.getPreviewFrame().locator( `.elementor-element-${ container.id }.e-grid .e-con-inner` );
			await expect.soft( element ).toHaveCSS( 'justify-items', container.setting );
			await expect.soft( element ).toHaveCSS( 'align-items', container.setting );
		}

		await editor.publishAndViewPage();

		// Assert.
		// Check container settings are set as expected on frontend.
		for ( const container of containers ) {
			const element = page.locator( `.elementor-element-${ container.id }.e-grid .e-con-inner` );
			await expect.soft( element ).toHaveCSS( 'justify-items', container.setting );
			await expect.soft( element ).toHaveCSS( 'align-items', container.setting );
		}
	} );

	test( 'Verify pasting of elements into the Container Element Add section', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			containerId1 = await editor.addElement( { elType: 'container' }, 'document' ),
			containerId2 = await editor.addElement( { elType: 'container' }, 'document' ),
			containerId3 = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( widgets.button, containerId1 );
		const headingId = await editor.addWidget( widgets.heading, containerId2 );
		await editor.addWidget( widgets.spacer, containerId3 );

		// Copy container 2 and paste it at the top of the page.
		await editor.copyElement( containerId2 );
		await editor.openAddElementSection( containerId1 );
		await editor.pasteElement( '.elementor-add-section-inline' );

		// Copy container 3 and paste it above container 2.
		await editor.copyElement( containerId3 );
		await editor.openAddElementSection( containerId2 );
		await editor.pasteElement( '.elementor-add-section-inline' );

		// Copy the heading widget and paste it above container 3.
		await editor.copyElement( headingId );
		await editor.openAddElementSection( containerId3 );
		await editor.pasteElement( '.elementor-add-section-inline' );

		// Assert.
		// Expected order:
		// 1. Copy of container 2 with a heading widget.
		// 2. Container 1.
		// 3. Copy of container 3 with a spacer widget.
		// 4. Container 2.
		// 5. A new container with a heading widget.
		// 6. Container 3.
		await expect.soft( editor.getPreviewFrame()
			.locator( '.e-con >> nth=0' )
			.locator( '.elementor-widget' ) )
			.toHaveClass( /elementor-widget-heading/ );
		expect.soft( await editor.getPreviewFrame()
			.locator( '.e-con >> nth=1' )
			.getAttribute( 'data-id' ) )
			.toEqual( containerId1 );
		await expect.soft( editor.getPreviewFrame()
			.locator( '.e-con >> nth=2' )
			.locator( '.elementor-widget' ) )
			.toHaveClass( /elementor-widget-spacer/ );
		expect.soft( await editor.getPreviewFrame()
			.locator( '.e-con >> nth=3' )
			.getAttribute( 'data-id' ) )
			.toEqual( containerId2 );
		await expect.soft( editor.getPreviewFrame()
			.locator( '.e-con >> nth=4' )
			.locator( '.elementor-widget' ) )
			.toHaveClass( /elementor-widget-heading/ );
		expect.soft( await editor.getPreviewFrame()
			.locator( '.e-con >> nth=5' )
			.getAttribute( 'data-id' ) )
			.toEqual( containerId3 );
	} );

	test( 'Test container wizard', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const frame = editor.getPreviewFrame();

		await test.step( 'Test container type selector', async () => {
			await frame.locator( '.elementor-add-section-button' ).click();
			const toFlex = frame.locator( '.flex-preset-button' );
			const toGrid = frame.locator( '.grid-preset-button' );
			await expect.soft( toFlex ).toBeVisible();
			await expect.soft( toGrid ).toBeVisible();
			await frame.locator( '.elementor-add-section-close' ).click();
		} );

		await test.step( 'Test wizard flex container', async () => {
			await frame.locator( '.elementor-add-section-button' ).click();
			await frame.locator( '.flex-preset-button' ).click();
			const flexList = frame.locator( '.e-con-select-preset__list' );
			await expect.soft( flexList ).toBeVisible();
			await frame.locator( '.elementor-add-section-close' ).click();
		} );

		await test.step( 'Test wizard grid container', async () => {
			await frame.locator( '.elementor-add-section-button' ).click();
			await frame.locator( '.grid-preset-button' ).click();
			const gridList = frame.locator( '.e-con-select-preset-grid__list' );
			await expect.soft( gridList ).toBeVisible();
		} );
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
} );

async function toggleResponsiveControl( page: Page, justifyControlsClass: string, breakpoints: string[], i: number ) {
	await page.click( `${ justifyControlsClass } .eicon-device-${ breakpoints[ i ] }` );
	if ( i < breakpoints.length - 1 ) {
		await page.click( `${ justifyControlsClass } .eicon-device-${ breakpoints[ i + 1 ] }` );
	} else {
		await page.click( `${ justifyControlsClass } .eicon-device-${ breakpoints[ 0 ] }` );
	}
}

async function captureJustifySnapShot(
	editor: EditorPage,
	breakpoints: string[],
	i: number,
	direction: string,
	page: Page,
	snapshotPrefix: string ) {
	await editor.page.click( `.elementor-control-responsive-${ breakpoints[ i ] } .eicon-arrow-${ direction }` );

	const justifyControlsClass = `.elementor-group-control-justify_content.elementor-control-responsive-${ breakpoints[ i ] }`;
	const justifyControlsContent = await page.$( `${ justifyControlsClass } .elementor-control-content ` );
	await page.waitForLoadState( 'networkidle' ); // Let the icons rotate
	expect.soft( await justifyControlsContent.screenshot( {
		type: 'jpeg',
		quality: 90,
	} ) ).toMatchSnapshot( `container-justify-controls-${ snapshotPrefix }-${ direction }-${ breakpoints[ i ] }.jpeg` );

	await toggleResponsiveControl( page, justifyControlsClass, breakpoints, i );
}

async function testJustifyDirections( directions: string[], breakpoints: string[], editor: EditorPage, page: Page, snapshotPrefix: 'rtl' | 'ltr' ) {
	for ( const direction of directions ) {
		for ( let i = 0; i < breakpoints.length; i++ ) {
			await captureJustifySnapShot( editor, breakpoints, i, direction, page, snapshotPrefix );
		}
	}
}
