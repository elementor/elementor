var ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' ),
	ControlOrderItemView;

ControlOrderItemView = ControlMultipleBaseItemView.extend( {
	ui: function() {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.reverseOrderLabel = '.elementor-control-order-label';

		return ui;
	},

	changeLabelTitle: function() {
		var reverseOrder = this.getControlValue( 'reverse_order' );

		this.ui.reverseOrderLabel.attr( 'title', reverseOrder ? __( 'Ascending order', 'elementor' ) : __( 'Descending order', 'elementor' ) );
	},

	onRender: function() {
		ControlMultipleBaseItemView.prototype.onRender.apply( this, arguments );

		this.changeLabelTitle();
	},

	onInputChange: function() {
		this.changeLabelTitle();
	},
} );

module.exports = ControlOrderItemView;
