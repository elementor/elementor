var SettingsPageView = require( './panel-page' ),
	SettingsModel = require( './model' ),
	SettingsPageManager;

SettingsPageManager = function() {
	var self = this;

	var addPanelPage = function() {
		elementor.getPanelView().addPage( 'settingsPage', {
			getView: function() {
				return SettingsPageView;
			},
			title: elementor.translate( 'page_settings' ),
			options: {
				model: self.createModel(),
				manager: self
			}
		} );
	};

	self.save = function( settingsModel, options ) {
		var params = {
			data: {
				id: settingsModel.get( 'id' ),
				settings: settingsModel.toJSON()
			},
			success: function() {
				if ( options.success ) {
					options.success();
				}
			}
		};

		if ( options.error ) {
			params.error = options.error;
		}

		elementor.ajax.send( 'save_settings', params );
	};

	self.createModel = function() {
		var model = new SettingsModel( elementor.config.page_settings );
		return model;
	};

	self.init = function() {
		elementor.on( 'preview:loaded', addPanelPage );
	};
};

module.exports = new SettingsPageManager();
