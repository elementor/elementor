const { WidgetBase } = require( './widget-base' );

class TextEditor extends WidgetBase {
	static getType() {
		return 'text-editor';
	}

	async testControl( control, controlId, assertionsCallback ) {
		await control.setup();

		// Wait for server render after switching between tabs.
		if ( [ 'align' ].includes( controlId ) ) {
			await this.editor.page.waitForTimeout( 1000 );
		}

		await control.test( async ( currentControlValue ) => {
			await assertionsCallback( controlId, currentControlValue );
		} );

		await control.teardown();
	}
}

module.exports = {
	TextEditor,
};
