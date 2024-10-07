import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';

test.describe( 'Container Grid tests @container', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			container: true,
		} );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test( 'Test grid container', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			gridColumnsControl = page.locator( '.elementor-control-grid_columns_grid' ),
			gridRowsControl = page.locator( '.elementor-control-grid_rows_grid' ),
			containerId = await editor.addElement( { elType: 'container' }, 'document' );

		// Arrange.
		await test.step( 'Arrange', async () => {
			await editor.closeNavigatorIfOpen();
			await editor.setSelectControlValue( 'container_type', 'grid' );
		} );

		const frame = editor.getPreviewFrame();
		let container = frame.locator( '.e-grid .e-con-inner' );

		await test.step( 'Assert gaps', async () => {
			await page.locator( '.elementor-control-grid_gaps .elementor-link-gaps' ).first().click();
			await page.locator( '.elementor-control-grid_gaps .elementor-control-gap:nth-child(1) input' ).first().fill( '10' );
			await page.locator( '.elementor-control-grid_gaps .elementor-control-gap:nth-child(2) input' ).first().fill( '20' );
			await expect( container ).toHaveCSS( 'gap', '20px 10px' );
		} );

		await test.step( 'Mobile rows unit are on FR', async () => {
			await editor.changeResponsiveView( 'mobile' );

			const rowsMobileUnitLabel = page.locator( '.elementor-group-control-rows_grid .e-units-switcher' ).first();
			await expect( rowsMobileUnitLabel ).toHaveAttribute( 'data-selected', 'fr' );

			await editor.changeResponsiveView( 'desktop' );
		} );

		await test.step( 'Assert Align Content control to be visible when Rows Grid is set to custom', async () => {
			// Arrange
			const alignContentControl = page.locator( '.elementor-control-grid_align_content' );

			// Assert - Check the controls initial state
			await expect( alignContentControl ).not.toBeVisible();

			// Act - Set Grid Rows to custom unit
			await gridRowsControl.locator( '.e-units-switcher' ).click();
			await gridRowsControl.locator( '[data-choose="custom"]' ).click();

			// Assert - Align content control is visible
			await expect( alignContentControl ).toBeVisible();
		} );

		await test.step( 'Assert Justify content control to be visible when Columns Grid is set to custom', async () => {
			// Arrange
			const justifyContentControl = page.locator( '.elementor-control-grid_justify_content' );

			// Assert - Check the controls initial state
			await expect( justifyContentControl ).not.toBeVisible();

			// Act - Set Grid Columns to custom unit
			await gridColumnsControl.locator( '.e-units-switcher' ).click();
			await gridColumnsControl.locator( '[data-choose="custom"]' ).click();

			// Assert - Justify content control should be visible
			await expect( justifyContentControl ).toBeVisible();
		} );

		await test.step( 'Assert justify and align start', async () => {
			await page.locator( '.elementor-control-grid_justify_content [data-tooltip="Start"]' ).click();
			await page.locator( '.elementor-control-grid_align_content [data-tooltip="Start"]' ).click();
			await expect( container ).toHaveCSS( 'justify-content', 'start' );
			await expect( container ).toHaveCSS( 'align-content', 'start' );
		} );

		await test.step( 'Assert justify align and content middle', async () => {
			await page.locator( '.elementor-control-grid_justify_content [data-tooltip="Middle"]' ).click();
			await page.locator( '.elementor-control-grid_align_content [data-tooltip="Middle"]' ).click();
			await expect( container ).toHaveCSS( 'justify-content', 'center' );
			await expect( container ).toHaveCSS( 'align-content', 'center' );
		} );

		await test.step( 'Assert justify align and content end', async () => {
			await page.locator( '.elementor-control-grid_justify_content [data-tooltip="End"]' ).click();
			await page.locator( '.elementor-control-grid_align_content [data-tooltip="End"]' ).click();
			await expect( container ).toHaveCSS( 'justify-content', 'end' );
			await expect( container ).toHaveCSS( 'align-content', 'end' );
		} );

		await test.step( 'Assert grid auto flow', async () => {
			await editor.setSelectControlValue( 'grid_auto_flow', 'row' );
			await expect( container ).toHaveCSS( 'grid-auto-flow', 'row' );
			await editor.setSelectControlValue( 'grid_auto_flow', 'column' );
			await expect( container ).toHaveCSS( 'grid-auto-flow', 'column' );
		} );

		await test.step( 'Assert justify align and content start on full width', async () => {
			await editor.setSelectControlValue( 'content_width', 'full' );
			await page.locator( '.elementor-control-grid_justify_content [data-tooltip="Start"]' ).click();
			await page.locator( '.elementor-control-grid_align_content [data-tooltip="Start"]' ).click();
			container = frame.locator( `.elementor-element-${ containerId }` );
			await expect( container ).toHaveCSS( 'justify-content', 'start' );
			await expect( container ).toHaveCSS( 'align-content', 'start' );
		} );

		await test.step( 'Assert justify align and content middle on full width', async () => {
			await page.locator( '.elementor-control-grid_justify_content [data-tooltip="Middle"]' ).click();
			await page.locator( '.elementor-control-grid_align_content [data-tooltip="Middle"]' ).click();
			container = frame.locator( `.elementor-element-${ containerId }` );
			await expect( container ).toHaveCSS( 'justify-content', 'center' );
			await expect( container ).toHaveCSS( 'align-content', 'center' );
		} );

		await test.step( 'Assert justify align and content end on full width', async () => {
			await page.locator( '.elementor-control-grid_justify_content [data-tooltip="End"]' ).click();
			await page.locator( '.elementor-control-grid_align_content [data-tooltip="End"]' ).click();
			container = frame.locator( `.elementor-element-${ containerId }` );
			await expect( container ).toHaveCSS( 'justify-content', 'end' );
			await expect( container ).toHaveCSS( 'align-content', 'end' );
		} );

		await test.step( 'Assert that the drag area is visible when using boxed width', async () => {
			await editor.setSelectControlValue( 'content_width', 'boxed' );
			const dragAreaIsVisible = await editor.getPreviewFrame()
				.locator( '.elementor-empty-view' )
				.evaluate( ( element: HTMLElement ) => {
					return 99 < element.offsetWidth; // The min-width is 100px.
				} );
			expect( dragAreaIsVisible ).toBeTruthy();
		} );

		await test.step( 'Assert boxed width content alignment', async () => {
			await editor.setSelectControlValue( 'content_width', 'boxed' );
			await editor.setSliderControlValue( 'grid_columns_grid', '' );

			// Add flex container.
			const flexContainerId = await editor.addElement( { elType: 'container' }, 'document' );

			// Assert.
			const gridDragAreaOffsetLeft = await editor.getPreviewFrame()
					.locator( '.e-grid .elementor-empty-view' )
					.evaluate( ( gridContent: HTMLElement ) => gridContent.offsetLeft ),
				flexDragAreaOffsetLeft = await editor.getPreviewFrame()
					.locator( '.e-flex .elementor-empty-view' )
					.evaluate( ( flexContent: HTMLElement ) => flexContent.offsetLeft );
			expect( gridDragAreaOffsetLeft ).toEqual( flexDragAreaOffsetLeft );

			// Add heading.
			await editor.addWidget( 'heading', flexContainerId );
			await editor.getPreviewFrame().waitForSelector( '.elementor-widget-heading' );

			// Assert.
			const headingOffsetLeft = await editor.getPreviewFrame()
				.locator( '.elementor-widget-heading' )
				.evaluate( ( heading: HTMLElement ) => heading.offsetLeft );
			expect( gridDragAreaOffsetLeft ).toEqual( headingOffsetLeft );

			// Remove flex container.
			await editor.removeElement( flexContainerId );
		} );

		await test.step( 'Assert correct positioning of the grid preset container when using the Add Container functionality', async () => {
			// Assert that the first container has data-id = containerId.
			expect( await frame.locator( '.e-con' ).first().getAttribute( 'data-id' ) ).toEqual( containerId );

			await editor.openAddElementSection( containerId );
			await frame.locator( '.elementor-add-section-inline .elementor-add-section-button' ).click();
			await frame.locator( '.elementor-add-section-inline .grid-preset-button' ).click();
			await frame.locator( `.elementor-add-section-inline [data-structure="2-1"]` ).click();

			// First container should be the new container.
			const newContainerId = await frame.locator( '.e-con >> nth=0' ).getAttribute( 'data-id' );
			expect( newContainerId ).not.toEqual( containerId );
			// The second container should be the existing container.
			expect( await frame.locator( '.e-con >> nth=1' ).getAttribute( 'data-id' ) ).toEqual( containerId );

			await editor.removeElement( newContainerId );
		} );

		await test.step( 'Assert correct icons for Justify Items and Align Items', async () => {
			await editor.selectElement( containerId );
			await expect( page
				.locator( '.elementor-control-grid_justify_items .elementor-choices label >> nth=0' )
				.locator( 'i' ) )
				.toHaveClass( /eicon-align-start-h/ );
			await expect( page
				.locator( '.elementor-control-grid_align_items .elementor-choices label >> nth=0' )
				.locator( 'i' ) )
				.toHaveClass( /eicon-align-start-v/ );

			await editor.setSelectControlValue( 'grid_auto_flow', 'column' );
			await expect( page
				.locator( '.elementor-control-grid_justify_items .elementor-choices label >> nth=0' )
				.locator( 'i' ) )
				.not.toHaveCSS( 'transform', 'matrix( 0, -1, 1, 0, 0, 0 )' );
			await expect( page
				.locator( '.elementor-control-grid_align_items .elementor-choices label >> nth=0' )
				.locator( 'i' ) )
				.not.toHaveCSS( 'transform', 'matrix( 0, -1, 1, 0, 0, 0 )' );
			await editor.setSelectControlValue( 'grid_auto_flow', 'row' );
		} );

		await test.step( 'Assert mobile is in one column', async () => {
			await editor.changeResponsiveView( 'mobile' );

			const gridTemplateColumnsCssValue = await container.evaluate( ( element ) => {
				return window.getComputedStyle( element ).getPropertyValue( 'grid-template-columns' );
			} );

			const isOneColumn = ! hasWhiteSpace( gridTemplateColumnsCssValue );

			expect( isOneColumn ).toBeTruthy();

			await editor.changeResponsiveView( 'desktop' );
		} );

		await test.step( 'Elements with class .ui-resizable-e inside grid-containers should not be visible', async () => {
			// Act
			const buttonID = await editor.addWidget( 'button', containerId ),
				buttonSelector = `.elementor-element-${ buttonID }`,
				buttonHandle = frame.locator( buttonSelector ).locator( '.ui-resizable-e' );

			// Assert
			await expect( buttonHandle ).not.toBeVisible();
			await expect( buttonHandle ).toHaveCount( 0 );

			// Clean up
			await editor.removeElement( buttonID );
		} );

		await test.step( 'Elements with class .ui-resizable-e inside flex-containers should be visible', async () => {
			// Act
			const flexContainerId = await editor.addElement( { elType: 'container' }, 'document' ),
				buttonID = await editor.addWidget( 'button', flexContainerId ),
				buttonSelector = `.elementor-element-${ buttonID }`,
				buttonHandle = frame.locator( buttonSelector ).locator( '.ui-resizable-e' );

			// Assert
			await expect( buttonHandle ).toBeVisible();
			await expect( buttonHandle ).toHaveCount( 1 );

			// Clean up
			await editor.removeElement( flexContainerId );
		} );
	} );

	test( 'Grid container presets', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const frame = editor.getPreviewFrame();

		await test.step( 'Assert preset: rows-1 columns-2', async () => {
			await testPreset( frame, editor, 1, 2 );
		} );

		await test.step( 'Assert preset: rows-2 columns-1', async () => {
			await testPreset( frame, editor, 2, 1 );
		} );

		await test.step( 'Assert preset: rows-1 columns-3', async () => {
			await testPreset( frame, editor, 1, 3 );
		} );

		await test.step( 'Assert preset: rows-3 columns-1', async () => {
			await testPreset( frame, editor, 3, 1 );
		} );

		await test.step( 'Assert preset: rows-2 columns-2', async () => {
			await testPreset( frame, editor, 2, 2 );
		} );

		await test.step( 'Assert preset: rows-2 columns-3', async () => {
			await testPreset( frame, editor, 2, 3 );
		} );
	} );

	test( 'Test grid outline', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			parentContainer = await editor.addElement( { elType: 'container' }, 'document' );

		// Arrange.
		await test.step( 'Arrange', async () => {
			await editor.closeNavigatorIfOpen();
			await editor.setSelectControlValue( 'container_type', 'grid' );
		} );

		const frame = editor.getPreviewFrame(),
			gridOutline = frame.locator( '.e-grid-outline' ),
			gridOutlineChildren = frame.locator( '.e-grid-outline-item' );

		let gridOutlineChildrenInitialValue = 6;

		await test.step( 'Assert default outline', async () => {
			await expect( gridOutline ).toBeVisible();
			await expect( gridOutlineChildren ).toHaveCount( gridOutlineChildrenInitialValue );
		} );

		await test.step( 'Assert turn off the grid outline control', async () => {
			await editor.setSwitcherControlValue( 'grid_outline', false );
			await expect( gridOutline ).not.toBeVisible();
		} );

		await test.step( 'Assert outline turn on', async () => {
			await editor.setSwitcherControlValue( 'grid_outline', true );
			await expect( gridOutline ).toBeVisible();
		} );

		await test.step( 'Assert number of child elements when there are less items than grid cells', async () => {
			// Arrange.
			gridOutlineChildrenInitialValue = 12;

			// Act.
			await editor.setSliderControlValue( 'grid_columns_grid', '4' );
			await editor.setSliderControlValue( 'grid_rows_grid', '3' );

			// Assert.
			await expect( gridOutlineChildren ).toHaveCount( gridOutlineChildrenInitialValue );
		} );

		await test.step( 'Assert outline matches responsive grid', async () => {
			gridOutlineChildrenInitialValue = 4;

			// Open responsive bar and select mobile view
			const firstGridOutlineChildren = gridOutline.first().locator( '.e-grid-outline-item' );
			await editor.changeResponsiveView( 'tablet' );
			await editor.setSliderControlValue( 'grid_columns_grid_tablet', '2' );
			await editor.setSliderControlValue( 'grid_rows_grid_tablet', '2' );

			await expect( gridOutline.first() ).toBeVisible();

			await editor.setSelectControlValue( 'content_width', 'full' );

			await expect( firstGridOutlineChildren ).toHaveCount( gridOutlineChildrenInitialValue );

			await editor.removeElement( parentContainer );
			await editor.changeResponsiveView( 'desktop' );
		} );

		await test.step( 'Assert number of child elements when there are more items than grid cells', async () => {
			// Arrange
			const newParentContainer = await editor.addElement( { elType: 'container' }, 'document' ),
				numberOfWidgets = 5,
				expectedNumberOfChildren = 6;

			await editor.setSelectControlValue( 'container_type', 'grid' );

			await editor.setSliderControlValue( 'grid_columns_grid', '2' );
			await editor.setSliderControlValue( 'grid_rows_grid', '2' );

			// Act.
			for ( let i = 0; i < numberOfWidgets; i++ ) {
				await editor.addWidget( 'button', newParentContainer );
			}

			// Assert.
			await expect( gridOutlineChildren ).toHaveCount( expectedNumberOfChildren );
		} );
	} );

	test( 'Test grid outline multiple controls', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame(),
			gridOutline = frame.locator( '.e-grid-outline' );

		// Arrange.
		await test.step( 'Arrange', async () => {
			await editor.addElement( { elType: 'container' }, 'document' );
			await editor.closeNavigatorIfOpen();
			await editor.setSelectControlValue( 'container_type', 'grid' );
		} );

		await test.step( 'Check that gap control effects the grid outline ', async () => {
			const desiredGapValue = '30px 30px';
			await page.locator( '.elementor-control-grid_gaps .elementor-control-gap >> nth=0' ).locator( 'input' ).fill( '30' );

			await expect( gridOutline ).toHaveCSS( 'grid-gap', desiredGapValue );
		} );

		await test.step( 'Check that Custom control is set to grid outline', async () => {
			const desiredCustomValue = '50px 150px 100px 100px',
				gridColumnsControl = page.locator( '.elementor-control-grid_columns_grid' );

			await gridColumnsControl.locator( '.e-units-switcher' ).click();
			await gridColumnsControl.locator( '[data-choose="custom"]' ).click();
			await gridColumnsControl.locator( '.elementor-slider-input input' ).fill( '50px 150px repeat(2, 100px)' );

			await expect( gridOutline ).toHaveCSS( 'grid-template-columns', desiredCustomValue );
		} );
	} );

	test( 'Check empty view min height', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		// Arrange.
		await test.step( 'Arrange', async () => {
			await editor.addElement( { elType: 'container' }, 'document' );
			await editor.closeNavigatorIfOpen();
			await editor.setSelectControlValue( 'container_type', 'grid' );
		} );

		const frame = editor.getPreviewFrame(),
			emptyView = frame.locator( '.elementor-empty-view' ),
			gridRowsControl = page.locator( '.elementor-control-grid_rows_grid' );

		await test.step( 'Empty view min-height should be auto when grid-rows unit is set to custom', async () => {
			// Arrange.
			const desiredCustomValue = '50px 150px 100px 100px',
				desiredMinHeight = 'auto';

			// Act.
			await gridRowsControl.locator( '.e-units-switcher' ).click();
			await gridRowsControl.locator( '[data-choose="custom"]' ).click();
			await gridRowsControl.locator( '.elementor-slider-input input' ).fill( desiredCustomValue );

			// Assert.
			await expect( emptyView ).toHaveCSS( 'min-height', desiredMinHeight );
		} );

		await test.step( 'Empty view min-height should be 100px when grid-rows custom control has no value', async () => {
			// Arrange.
			const desiredCustomValue = '',
				desiredMinHeight = '100px';

			// Act.
			await gridRowsControl.locator( '.e-units-switcher' ).click();
			await gridRowsControl.locator( '[data-choose="custom"]' ).click();
			await gridRowsControl.locator( '.elementor-slider-input input' ).fill( desiredCustomValue );

			// Assert.
			await expect( emptyView ).toHaveCSS( 'min-height', desiredMinHeight );
		} );

		await test.step( 'Empty view min-height should be 100px when grid-rows custom control has number value', async () => {
			// Arrange.
			const desiredCustomValue = '2',
				desiredMinHeight = '100px';

			// Act.
			await gridRowsControl.locator( '.e-units-switcher' ).click();
			await gridRowsControl.locator( '[data-choose="custom"]' ).click();
			await gridRowsControl.locator( '.elementor-slider-input input' ).fill( desiredCustomValue );

			// Assert.
			await expect( emptyView ).toHaveCSS( 'min-height', desiredMinHeight );
		} );

		await test.step( 'Empty view min-height should be 100px when grid-rows unit is set to fr ', async () => {
			// Arrange.
			const desiredMinHeight = '100px',
				desiredNumberOfRows = '2';

			// Act.
			await gridRowsControl.locator( '.e-units-switcher' ).click();
			await gridRowsControl.locator( '[data-choose="fr"]' ).click();
			await gridRowsControl.locator( '.elementor-slider-input input' ).fill( desiredNumberOfRows );

			// Assert.
			await expect( emptyView ).toHaveCSS( 'min-height', desiredMinHeight );
		} );
	} );

	test( 'Test grid back arrow', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const frame = editor.getPreviewFrame();
		await frame.locator( '.elementor-add-section-button' ).click();

		await test.step( 'Assert back arrow in flex presets', async () => {
			await frame.locator( '.flex-preset-button' ).click();
			const backArrow = frame.locator( '.elementor-add-section-back' );
			await expect( backArrow ).toBeVisible();
			await backArrow.click();
			const selectTypeView = frame.locator( '[data-view="select-type"]' );
			await expect( selectTypeView ).toBeVisible();
		} );

		await test.step( 'Assert back arrow in grid presets', async () => {
			await frame.locator( '.grid-preset-button' ).click();
			const backArrow = frame.locator( '.elementor-add-section-back' );
			await expect( backArrow ).toBeVisible();
			await backArrow.click();
			const selectTypeView = frame.locator( '[data-view="select-type"]' );
			await expect( selectTypeView ).toBeVisible();
		} );

		await test.step( 'Assert back arrow in not visible when clicked on plus button', async () => {
			await frame.locator( '.grid-preset-button' ).click();
			await frame.locator( '[data-structure="2-2"]' ).click();
			await frame.locator( '.elementor-editor-element-add' ).click();
			const backArrow = frame.locator( '.elementor-add-section-back' ).first();
			await expect( backArrow ).not.toBeVisible();
		} );
	} );

	test( 'Test grid auto flow on different breakpoints', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		await editor.addElement( { elType: 'container' }, 'document' );
		await editor.closeNavigatorIfOpen();
		await editor.setSelectControlValue( 'container_type', 'grid' );

		const frame = editor.getPreviewFrame();
		const container = frame.locator( '.e-grid .e-con-inner' );

		await test.step( 'Assert auto flow on desktop', async () => {
			await testAutoFlowByDevice( editor, container, 'desktop' );
		} );

		await test.step( 'Assert auto flow on tablet', async () => {
			await testAutoFlowByDevice( editor, container, 'tablet' );
		} );

		await test.step( 'Assert auto flow on mobile', async () => {
			await testAutoFlowByDevice( editor, container, 'mobile' );
		} );
	} );

	test( 'Test Empty View should show', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		await test.step( 'Arrange', async () => {
			await editor.closeNavigatorIfOpen();
			const containerId = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.setSelectControlValue( 'container_type', 'grid' );
			await editor.addWidget( 'heading', containerId );
		} );

		await test.step( 'After a widget is added', async () => {
			await expect( editor.getPreviewFrame().locator( '.elementor-first-add' ) ).toHaveCount( 1 );
		} );

		await test.step( 'On initial page load when container is not empty', async () => {
			await editor.saveAndReloadPage();
			await editor.waitForPanelToLoad();
			await expect( editor.getPreviewFrame().locator( '.elementor-first-add' ) ).toHaveCount( 1 );
		} );
	} );

	test( 'Test Empty View should not distorse preview', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		let containerId;
		let gridRowsControl;

		await test.step( 'Arrange', async () => {
			await editor.closeNavigatorIfOpen();
			containerId = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.setSelectControlValue( 'container_type', 'grid' );

			gridRowsControl = page.locator( '.elementor-control-grid_rows_grid' );
			const columnsRowControl = page.locator( '.elementor-control-grid_columns_grid' );

			await columnsRowControl.locator( '.elementor-slider-input input' ).fill( '3' );
			await gridRowsControl.locator( '.elementor-slider-input input' ).fill( '2' );

			for ( let i = 0; i < 6; i++ ) {
				await editor.addWidget( 'heading', containerId );
			}
		} );

		await test.step( 'Empty item should not be presented', async () => {
			await expect( editor.getPreviewFrame().locator( '.elementor-empty-view' ) ).toBeHidden();
		} );

		await test.step( 'Add one more item to see empty item', async () => {
			const latestAddedWidgetId = await editor.addWidget( 'heading', containerId );
			await expect( editor.getPreviewFrame().locator( '.elementor-empty-view' ) ).toBeVisible();

			await editor.removeElement( latestAddedWidgetId );
		} );

		await test.step( 'Increase number of rows to see empty item', async () => {
			await editor.selectElement( containerId );
			await gridRowsControl.locator( '.elementor-slider-input input' ).fill( '3' );
			await expect( editor.getPreviewFrame().locator( '.elementor-empty-view' ) ).toBeVisible();
		} );
	} );

	test( 'Test Empty View should not distorse preview on tablet', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage();

		let containerId;
		await test.step( 'Arrange', async () => {
			await editor.closeNavigatorIfOpen();
			containerId = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.setSelectControlValue( 'container_type', 'grid' );

			const gridRowsControl = page.locator( '.elementor-control-grid_rows_grid' );
			const columnsRowControl = page.locator( '.elementor-control-grid_columns_grid' );

			await columnsRowControl.locator( '.elementor-slider-input input' ).fill( '3' );
			await gridRowsControl.locator( '.elementor-slider-input input' ).fill( '2' );

			for ( let i = 0; i < 6; i++ ) {
				await editor.addWidget( 'heading', containerId );
			}
		} );

		await test.step( 'Empty item should not be presented', async () => {
			await expect( editor.getPreviewFrame().locator( '.elementor-empty-view' ) ).toBeHidden();
		} );
		//
		await test.step( 'Empty item should not be present in tablet', async () => {
			await editor.changeResponsiveView( 'tablet' );
			await expect( editor.getPreviewFrame().locator( '.elementor-empty-view' ) ).toBeHidden();
		} );

		await test.step( 'Change number of rows and columns to see empty item', async () => {
			await editor.selectElement( containerId );

			const gridRowsControlTablet = page.locator( '.elementor-control-grid_rows_grid_tablet' );
			const columnsRowControlTablet = page.locator( '.elementor-control-grid_columns_grid_tablet' );

			await gridRowsControlTablet.locator( '.elementor-slider-input input' ).fill( '2' );
			await columnsRowControlTablet.locator( '.elementor-slider-input input' ).fill( '4' );
			await expect( editor.getPreviewFrame().locator( '.elementor-empty-view' ) ).toBeVisible();
		} );
	} );

	test( 'Need Help url for grid and flex containers', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.selectElement( containerId );

		await test.step( 'Changing layout to flex', async () => {
			// Act
			await editor.setSelectControlValue( 'container_type', 'flex' );

			// Assert
			const linkElement = page.locator( '#elementor-panel__editor__help__link' );
			expect.soft( linkElement ).toHaveAttribute( 'href', 'https://go.elementor.com/widget-container' );
		} );

		await test.step( 'Changing layout to grid', async () => {
			// Act
			await editor.setSelectControlValue( 'container_type', 'grid' );

			// Assert
			const linkElement = page.locator( '#elementor-panel__editor__help__link' );
			expect.soft( linkElement ).toHaveAttribute( 'href', 'https://go.elementor.com/widget-container-grid' );
		} );

		await test.step( 'Add a flex container', async () => {
			// Act
			await frame.locator( '.elementor-add-section-area-button' ).first().click();
			await frame.locator( '.e-con-select-type__icons__icon.flex-preset-button' ).click();
			await frame.locator( '.e-con-select-preset__list .e-con-preset' ).first().click();

			// Assert
			const linkElement = page.locator( '#elementor-panel__editor__help__link' );
			expect.soft( linkElement ).toHaveAttribute( 'href', 'https://go.elementor.com/widget-container' );
		} );

		await test.step( 'Add a grid container', async () => {
			// Act
			await frame.locator( '.elementor-add-section-area-button' ).first().click();
			await frame.locator( '.e-con-select-type__icons__icon.grid-preset-button' ).click();
			await frame.locator( '.e-con-select-preset-grid__list .e-con-choose-grid-preset' ).first().click();

			// Assert
			const linkElement = page.locator( '#elementor-panel__editor__help__link' );
			expect.soft( linkElement ).toHaveAttribute( 'href', 'https://go.elementor.com/widget-container-grid' );
		} );

		await test.step( 'Select existing grid container', async () => {
			// Act
			await editor.selectElement( containerId );

			// Assert
			const linkElement = page.locator( '#elementor-panel__editor__help__link' );
			expect.soft( linkElement ).toHaveAttribute( 'href', 'https://go.elementor.com/widget-container-grid' );
		} );

		await page.waitForSelector( '#elementor-panel__editor__help__link' );
	} );
} );

function hasWhiteSpace( s ) {
	return /\s/g.test( s );
}

async function testPreset( frame, editor, rows, cols ) {
	await frame.locator( '.elementor-add-section-button' ).click();
	await frame.locator( '.grid-preset-button' ).click();
	await frame.locator( `[data-structure="${ rows }-${ cols }"]` ).click();

	const container = await frame.locator( '.e-con.e-grid > .e-con-inner' );

	// Because the browser will parse repeat(x, xfr) as pixels.
	// We need to get the initial value in pixels and compare it with the new value in repeat()
	const oldRowsAndCols = await container.evaluate( ( el ) => {
		const computedStyle = window.getComputedStyle( el );
		return [
			computedStyle.getPropertyValue( 'grid-template-rows' ),
			computedStyle.getPropertyValue( 'grid-template-columns' ),
		];
	} );

	await container.evaluate( ( el, rowsCount, colsCount ) => {
		el.style.setProperty( 'grid-template-rows', `repeat(${ rowsCount }, 1fr)` );
		el.style.setProperty( 'grid-template-columns', `repeat(${ colsCount }, 1fr)` );
	}, rows, cols );

	await expect( container ).toHaveCSS( 'grid-template-rows', oldRowsAndCols[ 0 ] );
	await expect( container ).toHaveCSS( 'grid-template-columns', oldRowsAndCols[ 1 ] );
	await editor.cleanContent();
}

async function testAutoFlowByDevice( editor, container, device ) {
	await editor.changeResponsiveView( device );
	const controlName = 'desktop' === device ? 'grid_auto_flow' : 'grid_auto_flow_' + device;
	await editor.setSelectControlValue( controlName, 'row' );
	await expect( container ).toHaveCSS( 'grid-auto-flow', 'row' );
	await editor.setSelectControlValue( controlName, 'column' );
	await expect( container ).toHaveCSS( 'grid-auto-flow', 'column' );
}
