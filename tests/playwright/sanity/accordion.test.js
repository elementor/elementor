const { test, expect } = require( '../utils/test' );

test.describe.only( 'Accordion widget', () => {
    test.afterEach( async ( { editorPage } ) => {
       await editorPage.cleanContent();
    } );

    test( 'screenshot on preview mode', async ( { editorPage } ) => {
        // Arrange.
        await editorPage.loadTemplate( 'accordion' );

        // Act.
        await editorPage.togglePreviewMode();

        // Assert.
        expect(
            await editorPage.getPreviewFrame()
                .locator( '.elementor-widget-wrap > .elementor-background-overlay' )
                .screenshot( { type: 'jpeg', quality: 90 } ),
        ).toMatchSnapshot( 'accordion.jpeg' );
    } );
} );
