const { WidgetBase } = require( './widget-base' );

class TextEditor extends WidgetBase {
	static getType() {
		return 'text-editor';
	}

	async beforeControlTest( { controlId } ) {
		// Wait for server render after switching between tabs.
		if ( 'align' === controlId ) {
			await this.editor.page.waitForTimeout( 1000 );
		}
	}
}

module.exports = {
	TextEditor,
};
