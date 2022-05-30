const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../pages/wp-admin-page.js' );

test( 'Column width: Desktop value should not affect mobile in post-content-widget - Experiment Breakpoints:On', async ( { page }, testInfo ) => {
    const wpAdmin = new WpAdminPage( page, testInfo );

    await wpAdmin.setExperiments( {
        additional_custom_breakpoints: true,
    } );

    const editor = await wpAdmin.useElementorCleanPost();

    // Set column width to 50%
    await editor.getFrame().click( '.elementor-add-section-button' );
    await editor.getFrame().click( '.elementor-select-preset-list li:nth-child(2)' );
    const secondColumn = await editor.getFrame().locator( '.elementor-column:nth-child(2)' ).first();
    await secondColumn.hover();
    await editor.getFrame().locator( '.elementor-column:nth-child(2) ul:has-text("Edit Column")' ).click();
    await page.click( 'input[type="number"]' );
    await page.fill( 'input[type="number"]', '50' );
    await page.click( 'button:has-text("Publish")' );

    // Create single page template
    await page.goto( '/wp-admin/edit.php?post_type=elementor_library&tabs_group=library' );
    await page.click( '.page-title-action >> text=Add New' );
    await page.selectOption( 'select[name="template_type"]', 'single-page' );
    await page.click( '[placeholder="Enter template name (optional)"]' );
    await page.fill( '[placeholder="Enter template name (optional)"]', 'single page' );
    await page.click( 'text=Create Template' );
    await page.click( 'text=Close Import Template Sync Library Save >> i' );

    // Add widget post-content
    await editor.addWidget( 'theme-post-content' );
    await page.click( 'button:has-text("Publish")' );
    await page.click( 'text=Add Condition' );
    await page.click( 'text=Save & Close' );

    // Go to preview page
    await page.click( '#elementor-panel-footer-saver-preview' );

    const [ previewPage ] = await Promise.all( [
        page.waitForEvent( 'popup' ),
        page.click( '#elementor-panel-footer-theme-builder-button-open-preview' ),
    ] );

    await previewPage.setViewportSize( {
        width: 480,
        height: 480,
    } );

    const column = await previewPage.locator( '.elementor-col-50.elementor-top-column' ).first();
    const container = await previewPage.locator( '.elementor-element-populated .elementor-container' );

    const columnBox = await column.boundingBox();
    const containerBox = await container.boundingBox();

    expect( columnBox.width ).toBe( containerBox.width );
} );
