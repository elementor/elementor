var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlSelect2ItemView;

import Select2 from 'elementor-editor-utils/select2.js';

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

		const elementSelect2Data = this.ui.select.data( 'select2' );

		if ( ! elementSelect2Data ) {
			this.select2Instance = new Select2( {
				$element: this.ui.select,
				options: this.getSelect2Options(),
			} );
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
		this.select2Instance.destroy();

		this.$el.remove();
	},
} );

module.exports = ControlSelect2ItemView;
