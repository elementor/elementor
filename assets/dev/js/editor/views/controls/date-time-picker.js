var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlDateTimePickerItemView;

ControlDateTimePickerItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.picker = '.elementor-date-time-picker';

		return ui;
	},

	onReady: function() {
		var self = this;

		var options = {
			onHide: function() {
				self.saveValue();
			}
		};

		this.ui.picker.appendDtpicker( options ).handleDtpicker( 'setDate', new Date( this.getControlValue() * 1000 ) );
	},

	saveValue: function() {
		var date = this.ui.picker.handleDtpicker( 'getDate' );
		this.setValue( date.getTime() / 1000 );
	},

	onBeforeDestroy: function() {
		this.saveValue();
		this.ui.picker.dtpicker( 'destroy' );
	}
} );

module.exports = ControlDateTimePickerItemView;
