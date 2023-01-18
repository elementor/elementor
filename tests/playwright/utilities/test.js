const base = require( '@playwright/test' );
const EditorPage = require( '../pages/editor-page' );
const { createPage, deletePage, createWpRestContext } = require( './rest-api' );

const test = base.test.extend( {
    editorPage: [
        async ( { browser }, use ) => {
            const apiContext = await createWpRestContext();

            const pageId = await createPage( apiContext );

            const page = await browser.newPage();

            const editorPage = new EditorPage( page, { config: { projects: [ { use: {} } ] } } );
            await editorPage.gotoPostId( pageId );

            await use(
                editorPage,
            );

            await deletePage( pageId, apiContext );
        },
        { scope: 'worker' },
    ],
} );

const expect = base.expect;

module.exports = {
    test,
    expect,
};
