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
		this.ui.select.select2( this.getSelect2Options() );
	},

	onBeforeDestroy: function() {
		// We always destroy the select2 instance because there are cases where the DOM element's data cache
		// itself has been destroyed but the select2 instance on it still exists
		this.ui.select.select2( 'destroy' );

		this.$el.remove();
	},

	onAfterExternalChange: function() {
		this.ui.select.select2( 'destroy' );

		this.onReady();

		ControlBaseDataView.prototype.onAfterExternalChange.apply( this, arguments );
	},
} );

module.exports = ControlSelect2ItemView;
