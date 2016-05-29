var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlIconItemView;

ControlIconItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.iconSelect = '.elementor-control-icon';

		return ui;
	},

	onReady: function() {
		this.ui.iconSelect.select2( {
			allowClear: true,
			templateResult: _.bind( this.iconsList, this ),
			templateSelection: _.bind( this.iconsList, this )
		} );
	},

	iconsList: function( icon ) {
		if ( ! icon.id ) {
			return icon.text;
		}
		return Backbone.$(
			'<span><i class="' + icon.id + '"></i> ' + icon.text + '</span>'
		);
	},

	onBeforeDestroy: function() {
		if ( this.ui.iconSelect.data( 'select2' ) ) {
			this.ui.iconSelect.select2( 'destroy' );
		}
		this.$el.remove();
	}
} );

module.exports = ControlIconItemView;
