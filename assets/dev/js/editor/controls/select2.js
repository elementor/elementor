var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlSelect2ItemView;

ControlSelect2ItemView = ControlBaseDataView.extend( {
	getSelect2Placeholder: function() {
		return this.ui.select.children( 'option:first[value=""]' ).text();
	},

	getSelect2DefaultOptions: function() {
		return {
			allowClear: true,
			placeholder: this.getSelect2Placeholder(),
			dir: elementorCommon.config.isRTL ? 'rtl' : 'ltr',
		};
	},

	getSelect2Options: function() {
		return jQuery.extend( this.getSelect2DefaultOptions(), this.model.get( 'select2options' ) );
	},

	onReady: function() {
		var self = this;
		_.defer( function() {
			self.ui.select.select2( self.getSelect2Options() );
		} );
	},

	onBeforeDestroy: function() {
		if ( this.ui.select.data( 'select2' ) ) {
			this.ui.select.select2( 'destroy' );
		}

		this.$el.remove();
	},
} );

module.exports = ControlSelect2ItemView;
