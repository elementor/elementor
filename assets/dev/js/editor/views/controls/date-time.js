var ControlBaseView = require( 'elementor-views/controls/base' ),
	ControlDateTimePickerItemView;

ControlDateTimePickerItemView = ControlBaseView.extend( {
	ui: function() {
		var ui = ControlBaseView.prototype.ui.apply( this, arguments );

		ui.picker = '.elementor-date-time-picker';

		return ui;
	},

	onReady: function() {
		var self = this;

		var options = _.extend( this.model.get( 'picker_options' ), {
			onHide: function() {
				self.saveValue();
			}
		} );

		this.ui.picker.appendDtpicker( options ).handleDtpicker( 'setDate', new Date( this.getControlValue() ) );
	},

	saveValue: function() {
		this.setValue( this.ui.input.val() );
	},

	onBeforeDestroy: function() {
		this.saveValue();
		this.ui.picker.dtpicker( 'destroy' );
	}
} );

module.exports = ControlDateTimePickerItemView;
