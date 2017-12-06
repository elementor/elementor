var BaseSettingsModel = require( 'elementor-elements/models/base-settings' ),
	ColumnSettingsModel;

ColumnSettingsModel = BaseSettingsModel.extend( {
	defaults: {
		_column_size: 100
	}
} );

module.exports = ColumnSettingsModel;
