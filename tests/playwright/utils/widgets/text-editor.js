const { WidgetBase } = require( './widget-base' );

class TextEditor extends WidgetBase {
	static getType() {
		return 'text-editor';
	}

	async testControl( control, controlId, assertionsCallback ) {
		await control.setup();

		await control.test( async ( currentControlValue ) => {
			// Wait for renders.
			if ( [ 'align' ].includes( controlId ) ) {
				await this.editor.page.waitForTimeout( 700 );
			}

			await assertionsCallback( controlId, currentControlValue );
		} );

		await control.teardown();
	}
}

module.exports = {
	TextEditor,
};
