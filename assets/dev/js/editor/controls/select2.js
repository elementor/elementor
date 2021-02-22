var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlSelect2ItemView;

import Select2 from 'elementor-editor-utils/select2.js';

ControlSelect2ItemView = ControlBaseDataView.extend( {
	getSelect2Placeholder: function() {
		return this.ui.select.children( 'option:first[value=""]' ).text();
	},

	getSelect2DefaultOptions: function() {
		const defaultOptions = {
			allowClear: true,
			placeholder: this.getSelect2Placeholder(),
			dir: elementorCommon.config.isRTL ? 'rtl' : 'ltr',
		},
			nonDeletableOptions = this.model.get( 'nonDeletableOptions' );

		// If any non-deletable options are passed, remove the 'x' element from the template for selected items.
		if ( nonDeletableOptions ) {
			defaultOptions.templateSelection = ( data, container ) => {
				if ( nonDeletableOptions.includes( data.id ) ) {
					jQuery( container )
						.addClass( 'e-non-deletable' )
						.find( '.select2-selection__choice__remove' ).remove();
				}

				return data.text;
			};
		}

		return defaultOptions;
	},

	getSelect2Options: function() {
		return jQuery.extend( this.getSelect2DefaultOptions(), this.model.get( 'select2options' ) );
	},

	applySavedValue: function() {
		ControlBaseDataView.prototype.applySavedValue.apply( this, arguments );

		const elementSelect2Data = this.ui.select.data( 'select2' );

		// Checking if the element itself was initiated with select2 functionality in case of multiple renders.
		if ( ! elementSelect2Data ) {
			this.select2Instance = new Select2( {
				$element: this.ui.select,
				options: this.getSelect2Options(),
			} );

			this.handleNonDeletableOptions();
		} else {
			this.ui.select.trigger( 'change' );
		}
	},

	handleNonDeletableOptions() {
		const nonDeletableOptions = this.model.get( 'nonDeletableOptions' );

		if ( nonDeletableOptions ) {
			this.ui.select.on( 'select2:unselecting', ( event ) => {
				if ( nonDeletableOptions.includes( event.params.args.data.id ) ) {
					event.preventDefault();
				}
			} );
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
