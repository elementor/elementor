const BasePage = require( './base-page.js' );
const EditorPage = require( './editor-page.js' );

/**
 * This post is used for any tests that need a post, with empty elements.
 *
 * @type {number}
 */
const CLEAN_POST_ID = 1;

module.exports = class WpAdminPage extends BasePage {
	async useElementorCleanPost() {
		await this.page.goto( `/wp-admin/post.php?post=${ CLEAN_POST_ID }&action=elementor` );

		await this.waitForPanel();

		const editor = new EditorPage( this.page, this.testInfo, CLEAN_POST_ID );

		await this.page.evaluate( () => $e.run( 'document/elements/empty', { force: true } ) );

		return editor;
	}

	async waitForPanel() {
		await this.page.waitForSelector( '.elementor-panel-loading', { state: 'detached' } );
		await this.page.waitForSelector( '#elementor-loading', { state: 'hidden' } );
	}
};
