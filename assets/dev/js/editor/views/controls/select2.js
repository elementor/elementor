var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlSelect2ItemView;

ControlSelect2ItemView = ControlBaseItemView.extend( {
	getSelect2Options: function() {
		var placeholder = this.ui.select.children( 'option:first[value=""]' ).text();

		return {
			allowClear: true,
			placeholder: placeholder
		};
	},

	onReady: function() {
		this.ui.select.select2( this.getSelect2Options() );
	},

	onBeforeDestroy: function() {
		if ( this.ui.select.data( 'select2' ) ) {
			this.ui.select.select2( 'destroy' );
		}

		this.$el.remove();
	}
} );

module.exports = ControlSelect2ItemView;
