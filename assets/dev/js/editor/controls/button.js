var ControlBaseView = require( 'elementor-controls/base' );

module.exports = ControlBaseView.extend( {

	ui() {
		var ui = ControlBaseView.prototype.ui.apply( this, arguments );

		ui.button = 'button';

		return ui;
	},

	events: {
		'click @ui.button': 'onButtonClick',
	},

	onButtonClick() {
		var eventName = this.model.get( 'event' );

		elementor.channels.editor.trigger( eventName, this );
	},
} );
