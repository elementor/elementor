const controls = require( './controls' );

module.exports = function createControl( config, { pluginName, version, widgetName, controlName } ) {
	const controlConfig = config.getControlConfig( pluginName, version, widgetName, controlName ),
		Control = controls?.[ controlConfig.type ];

	return new Control( controlConfig );
};
