var ControlMultipleBaseItemView = require( 'elementor-views/controls/base-multiple' ),
	ControlTimeItemView;

ControlTimeItemView = ControlMultipleBaseItemView.extend( {
	ui: function() {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.hours = '.elementor-control-time .elementor-control-time-hours';
		ui.minutes = '.elementor-control-time .elementor-control-time-minutes';

		return ui;
	},

	// Override the base events
	childEvents: {
		'change @ui.hours': 'onSelectClicked',
		'change @ui.minutes': 'onSelectClicked'
	},

	onReady: function() {
		var time = this.getControlValue();
		this.ui.hours.val( time.hours );
		this.ui.minutes.val( time.minutes );
	},

	onSelectClicked: function( event ) {
		this.setValue({
			hours: this.ui.hours.val(),
			minutes: this.ui.minutes.val()
		});

	}

} );

module.exports = ControlTimeItemView;
