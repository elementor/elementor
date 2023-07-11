const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../pages/wp-admin-page' );

test( 'Image Carousel widget sanity test lazyload', async ( { page }, testInfo ) => {
    const resourcesBaseDir = './tests/playwright/resources/';

    const wpAdmin = new WpAdminPage( page, testInfo ),
        editor = await wpAdmin.useElementorCleanPost();

    await editor.addWidget( 'image-carousel' );

    // Set Image carousel settings
    await page.selectOption( '.elementor-control-slides_to_show >> select', '1' );

    await page.click( '.elementor-control-section_additional_options' );
    await page.click( '.elementor-control-lazyload >> span' );
    await page.selectOption( '.elementor-control-autoplay >> select', 'no' );

    // Add images
    const images = [ 'elementor1', 'elementor2', 'elementor3', 'elementor4' ];
    const imageFileType = '.png';

    await page.click( '#elementor-controls >> text=Image Carousel' );
    await page.locator( '.elementor-control-gallery-add' ).click();
    await page.waitForSelector( '.media-modal >> .has-load-more >> .spinner:visible', { state: 'hidden' } );
    await page.waitForTimeout( 500 );

    for ( const image of images ) {
        const alreadyLoaded = await page.$( '[aria-label="' + image + '"]' );

        if ( alreadyLoaded ) {
            await page.click( '[aria-label="' + image + '"]' );
        } else {
            await page.click( 'text=Upload files' );

            await page.setInputFiles( 'input[type="file"]', resourcesBaseDir + image + imageFileType );
        }
    }

    await page.click( 'text=Create a new gallery' );
    await page.click( 'text=Insert gallery' );

    const widget = await editor.getPreviewFrame().waitForSelector( '.elementor-image-carousel' );
    const widgetImages = await widget.$$( '.swiper-slide >> img' );

    // The lazyload loads images from data-src into src.
    // If the src does not exist, the data-src should exist with the image src.
    for ( const image of widgetImages ) {
        const src = await image.getAttribute( 'src' );

        if ( src ) {
            expect( src ).toContain( '.png' );
        } else {
            const dataSrc = await image.getAttribute( 'data-src' );
            expect( dataSrc ).toContain( '.png' );
        }
    }
} );
