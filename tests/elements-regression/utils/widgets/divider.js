const { WidgetBase } = require( './widget-base' );

class Divider extends WidgetBase {
	static getType() {
		return 'divider';
	}

	getExcludedControls() {
		return [
			'align', // Cannot be tested alone, need also some size.
		];
	}
}

module.exports = {
	Divider,
};
