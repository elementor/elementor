var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlWPWidgetItemView;

ControlWPWidgetItemView = ControlBaseDataView.extend( {
	ui() {
		var ui = ControlBaseDataView.prototype.ui.apply( this, arguments );

		ui.form = 'form';
		ui.loading = '.wp-widget-form-loading';

		return ui;
	},

	events() {
		return {
			'keyup @ui.form :input': 'onFormChanged',
			'change @ui.form :input': 'onFormChanged',
		};
	},

	onFormChanged() {
		var idBase = 'widget-' + this.model.get( 'id_base' ),
			settings = this.ui.form.elementorSerializeObject()[ idBase ].REPLACE_TO_ID;

		this.setValue( settings );
	},

	onReady() {
		var self = this;

		elementorCommon.ajax.addRequest( 'editor_get_wp_widget_form', {
			data: {
				// Fake Widget ID
				id: self.model.cid,
				widget_type: self.model.get( 'widget' ),
				data: self.container.settings.toJSON(),
			},
			success( data ) {
				self.ui.form.html( data );
				// WP >= 4.8
				if ( wp.textWidgets ) {
					self.ui.form.addClass( 'open' );
					var event = new jQuery.Event( 'widget-added' );
					wp.textWidgets.handleWidgetAdded( event, self.ui.form );
					wp.mediaWidgets.handleWidgetAdded( event, self.ui.form );

					// WP >= 4.9
					if ( wp.customHtmlWidgets ) {
						wp.customHtmlWidgets.handleWidgetAdded( event, self.ui.form );
					}
				}

				const widgetType = self.model.get( 'widget' );

				elementor.hooks.doAction( `panel/widgets/${ widgetType }/controls/wp_widget/loaded`, self );
			},
		} );
	},
} );

module.exports = ControlWPWidgetItemView;
