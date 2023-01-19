const base = require( '@playwright/test' );
const EditorPage = require( '../pages/editor-page' );

const test = base.test.extend( {
    editorPage: [
        async ( { browser }, use ) => {
            const page = await browser.newPage();

            const editorPage = new EditorPage( page, { config: { projects: [ { use: {} } ] } } );

            await use(
                editorPage,
            );
        },
        { scope: 'worker' },
    ],
} );

const expect = base.expect;

module.exports = {
    test,
    expect,
};
