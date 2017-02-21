var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlSelect2ItemView;

ControlSelect2ItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.select = '.elementor-select2';

		return ui;
	},

	getSettings: function() {
		return {
			allowClear: true,
			placeholder: { // The `allowClear` must be used with the `placeholder` option
				id: ''
			}
		};
	},

	onReady: function() {
		this.ui.select.select2( this.getSettings() );
	},

	onBeforeDestroy: function() {
		if ( this.ui.select.data( 'select2' ) ) {
			this.ui.select.select2( 'destroy' );
		}

		this.$el.remove();
	}
} );

module.exports = ControlSelect2ItemView;
