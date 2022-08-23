const widgets = require( './widgets' );

module.exports = function createWidget( config, { pluginName, version, widgetName } ) {
	const widgetConfig = config.getWidgetConfig( pluginName, version, widgetName ),
		Widget = widgets?.[ widgetConfig.name ];

	return new Widget( widgetConfig );
};
