const { WidgetBase } = require( './widget-base' );

class TextEditor extends WidgetBase {
	static getType() {
		return 'text-editor';
	}

	getExcludedControls() {
		return [
			'column_gap', // Cannot be tested alone: must be along side with `column` control.
		];
	}
}

module.exports = {
	TextEditor,
};
