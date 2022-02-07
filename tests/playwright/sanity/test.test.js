const { test, expect } = require( '@playwright/test' );
const { EditorPage } = require( '../pages/editor-page' );
const { WpAdminPage } = require( '../pages/wp-admin-page' );

test( 'Image Carousel widget sanity test lazyload', async ( { page } ) => {
    const resourcesBaseDir = './tests/playwright/resources/';

    const wpAdmin = new WpAdminPage( page );
    await wpAdmin.createNewPage();

    const editor = new EditorPage( page );
    await editor.addWidget( 'image-carousel' );

    // Set Image carousel settings
    await page.selectOption('.elementor-control-slides_to_show >> select', '1');

    await page.click('text=Additional Options');
    await page.click('text=Image Carousel Additional Options Lazyload Autoplay Yes No Pause on Hover Yes No >> span');
    await page.selectOption('.elementor-control-autoplay >> select', 'no');

    // Add images
    const images = [ 'elementor1', 'elementor2', 'elementor3', 'elementor4' ];
    const imageFileType = '.png';

    await page.click( '#elementor-controls >> text=Image Carousel');
    await page.click( '[aria-label="Add\\ Images"]');
    await page.waitForTimeout( 3000 );

    for ( const image of images ) {
        const alreadyLoaded = await page.$( '[aria-label="' + image + '"]' );

        if( alreadyLoaded ) {
            await page.click( '[aria-label="' + image + '"]' );
        } else {
            await page.click('text=Upload files');

            await page.setInputFiles( 'input[type="file"]', resourcesBaseDir + image + imageFileType );
        }
    }

    await page.click('text=Create a new gallery');
    await page.click('text=Insert gallery');

    const widget = await editor.getFrame().waitForSelector( '.elementor-image-carousel' );
    const widgetImages = await widget.$$( '.swiper-slide' );

    for ( const image of widgetImages ) {
        const img = await image.$( 'img' );
        const src = await img.getAttribute( 'src' );

        if( src ) {
            expect( src ).toContain( '.png' );
        } else {
            const dataSrc = await img.getAttribute( 'data-src' );
            expect( dataSrc ).toContain( '.png' );
        }
    }
} );
