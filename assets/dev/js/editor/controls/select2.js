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

	applySavedValue: function() {
		ControlBaseDataView.prototype.applySavedValue.apply( this, arguments );

		const select2Instance = this.ui.select.data( 'select2' );

		if ( ! select2Instance ) {
			this.ui.select.select2( this.getSelect2Options() );
		} else {
			this.ui.select.trigger( 'change' );
		}
	},

	onReady: function() {
		elementorCommon.helpers.softDeprecated( 'onReady', '3.0.0' );
	},

	onBeforeDestroy: function() {
		// We always destroy the select2 instance because there are cases where the DOM element's data cache
		// itself has been destroyed but the select2 instance on it still exists
		this.ui.select.select2( 'destroy' );

		this.$el.remove();
	},
} );

module.exports = ControlSelect2ItemView;
