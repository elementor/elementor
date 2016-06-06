var Modals;

Modals = {
	init: function() {
		this.initModalWidgetType();
	},

	initModalWidgetType: function() {
		var modalProperties = {
			getDefaultSettings: function() {
				var settings = DialogsManager.getWidgetType( 'options' ).prototype.getDefaultSettings.apply( this, arguments );

				return _.extend( settings, {
					position: {
						my: 'center',
						at: 'center'
					},
					contentWidth: 'auto',
					contentHeight: 'auto'
				} );
			},
			buildWidget: function() {
				DialogsManager.getWidgetType( 'options' ).prototype.buildWidget.apply( this, arguments );

				var $closeButton = this.addComponent( 'closeButton', '<div><i class="fa fa-times"></i></div>' );

				this.getComponents( 'widgetContent' ).prepend( $closeButton );
			},
			attachEvents: function() {
				this.getComponents( 'closeButton' ).on( 'click', this.hide );
			},
			onReady: function() {
				DialogsManager.getWidgetType( 'options' ).prototype.onReady.apply( this, arguments );

				var components = this.getComponents(),
					settings = this.getSettings();

				if ( 'auto' !== settings.contentWidth ) {
					components.$message.width( settings.contentWidth );
				}

				if ( 'auto' !== settings.contentHeight ) {
					components.$message.height( settings.contentHeight );
				}
			}
		};

		DialogsManager.addWidgetType( 'elementor-modal', DialogsManager.getWidgetType( 'options' ).extend( 'elementor-modal', modalProperties ) );
	},

	createModal: function( properties ) {
		return elementor.dialogsManager.createWidget( 'elementor-modal', properties );
	}
};

module.exports = Modals;
