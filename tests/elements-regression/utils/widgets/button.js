const { WidgetBase } = require( './widget-base' );

class Button extends WidgetBase {
	static getType() {
		return 'button';
	}

	getExcludedControls() {
		return [
		];
	}
}

module.exports = {
	Button,
};
