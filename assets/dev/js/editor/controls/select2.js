var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlSelect2ItemView;

ControlSelect2ItemView = ControlBaseDataView.extend( {
	getSelect2Placeholder: function() {
		return this.ui.select.children( 'option:first[value=""]' ).text();
	},

	getSelect2Options: function() {
		return {
			allowClear: true,
			placeholder: this.getSelect2Placeholder(),
			dir: elementor.config.is_rtl ? 'rtl' : 'ltr'
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
