var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlWPWidgetItemView;

ControlWPWidgetItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.form = 'form';
		ui.loading = '.wp-widget-form-loading';

		return ui;
	},

	events: {
		'keyup @ui.form :input': 'onFormChanged',
		'change @ui.form :input': 'onFormChanged'
	},

	onFormChanged: function() {
		var idBase = 'widget-' + this.model.get( 'id_base' ),
			settings = this.ui.form.elementorSerializeObject()[ idBase ].REPLACE_TO_ID;

		this.setValue( settings );
	},

	onReady: function() {
		elementor.ajax.send( 'editor_get_wp_widget_form', {
			data: {
				// Fake Widget ID
				id: this.model.cid,
				widget_type: this.model.get( 'widget' ),
				data: JSON.stringify( this.elementSettingsModel.toJSON() )
			},
			success: _.bind( function( data ) {
				this.ui.form.html( data );
				// WP >= 4.8
				if ( wp.textWidgets ) {
					var event = new jQuery.Event( 'widget-added' );
					wp.textWidgets.handleWidgetAdded( event, this.ui.form );
					wp.mediaWidgets.handleWidgetAdded( event, this.ui.form );
				}

				elementor.hooks.doAction( 'panel/widgets/' + this.model.get( 'widget' ) + '/controls/wp_widget/loaded', this );
			}, this )
		} );
	}
} );

module.exports = ControlWPWidgetItemView;
