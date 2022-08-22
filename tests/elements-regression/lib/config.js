const controls = require( './controls/index' );
const widgets = require( './widgets/index' );
const widgetsConfig = require( '../widgets/index' );

module.exports = class Config {
	rawConfig = {};

	constructor( rawConfig, widgetsByPlugin ) {
		this.rawConfig = rawConfig;
	}

	static create() {
		const rawConfig = require( '../elementor.config' ); // Should be readed from a file based on option in the CLI

		return new Config( rawConfig );
	}

	getPluginsNames() {
		return Object.keys( this.rawConfig.plugins || [] );
	}

	getWidgetsConfigVersionsNames( pluginName ) {
		const pluginWidgetsConfigVersions = widgetsConfig[ pluginName ] || {};

		return Object.keys( pluginWidgetsConfigVersions );
	}

	getWidgetsNames( pluginName, version ) {
		const pluginWidgets = Object.keys( widgetsConfig[ pluginName ]?.[ version ] || {} );
		const availbleWidgtes = Object.keys( widgets );
		const requestedWidgetsConfig = this.rawConfig?.plugins?.[ pluginName ]?.widgets || {};

		const include = requestedWidgetsConfig.include || pluginWidgets;
		const exclude = requestedWidgetsConfig.exclude || [];

		return pluginWidgets
			.filter( ( name ) => availbleWidgtes.includes( name ) )
			.filter( ( name ) => include.includes( name ) )
			.filter( ( name ) => ! exclude.includes( name ) );
	}

	getControlsNames( pluginName, version, widgetName ) {
		const allControls = widgetsConfig?.[ pluginName ]?.[ version ]?.[ widgetName ]?.controls;
		const availbleControlsTypes = Object.keys( controls );
		const widgetSupportedControls = widgets?.[ widgetName ]?.getSupportedControls?.() || {};

		// For now, responsive controls are not supported.
		const responsiveControls = [ '_laptop', '_mobile', '_mobile_extra', '_tablet', '_tablet_extra', '_widescreen' ];

		const include = widgetSupportedControls.include || Object.keys( allControls );
		const exclude = widgetSupportedControls.exclude || [];

		return Object.entries( allControls )
			.filter( ( [ name, config ] ) => availbleControlsTypes.includes( config.type ) )
			.filter( ( [ name ] ) => include.includes( name ) )
			.filter( ( [ name ] ) => ! exclude.includes( name ) )
			// For now, responsive controls are not supported.
			.filter( ( [ name ] ) => responsiveControls.every(
				( responsiveSuffix ) => ! name.endsWith( responsiveSuffix ),
			) )
			// For now, conditions are not supported
			.filter( ( [ name, config ] ) => ! config.condition && ! config.conditions )
			.map( ( [ name ] ) => name );
	}

	getWidgetConfig( pluginName, version, widgetName ) {
		const { widget_type, name } = widgetsConfig?.[ pluginName ]?.[ version ]?.[ widgetName ] || {};

		return {
			name,
			type: widget_type,
		};
	}

	getControlConfig( pluginName, version, widgetName, controlName ) {
		const args = widgetsConfig?.[ pluginName ]?.[ version ]?.[ widgetName ]?.controls?.[ controlName ] || {};

		return {
			type: args.type,
			tab: args.tab,
			section: args.section,
			name: args.name,
			defaultValue: args.default,
			options: 'object' === typeof args.options ? Object.keys( args.options ) : undefined,
			isInsidePopover: args.hasOwnProperty( 'popover' ),
		};
	}
};
