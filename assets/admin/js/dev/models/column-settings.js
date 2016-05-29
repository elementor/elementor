var BaseSettingsModel = require( 'elementor-models/base-settings' ),
	ColumnSettingsModel;

ColumnSettingsModel = BaseSettingsModel.extend( {
	defaults: {
		_inline_size: '',
		_column_size: 100
	}
} );

module.exports = ColumnSettingsModel;
