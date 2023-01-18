const { test, expect } = require( '../utilities/test' );
// const WpAdminPage = require( '../pages/wp-admin-page.js' );

test.describe.only( 'Accordion widget', () => {
    test.afterEach( async ( { editorPage } ) => {
        await editorPage.cleanContent();
    } );

    test( 'Accordion', async ( { editorPage } ) => {
        // Arrange.
        await editorPage.loadTemplate( 'accordion' );
        // const wpAdmin = new WpAdminPage( page, testInfo ),
        // editor = await wpAdmin.useElementorPost( 'accordion' );

        // Act.
        await editorPage.togglePreviewMode();

        // Assert
        expect( await editorPage.getPreviewFrame().locator( '.elementor-widget-wrap > .elementor-background-overlay' ).screenshot( { type: 'jpeg', quality: 90 } ) ).toMatchSnapshot( 'accordion.jpeg' );
    } );
} );