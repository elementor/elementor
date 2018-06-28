var Schemes,
	Stylesheet = require( 'elementor-editor-utils/stylesheet' ),
	ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' );

Schemes = function() {
	var self = this,
		stylesheet,
		schemes = {},
		settings = {
			selectorWrapperPrefix: '.elementor-widget-'
		},
		elements = {};

	var buildUI = function() {
		elements.$previewHead.append( elements.$style );
	};

	var initElements = function() {
		elements.$style = jQuery( '<style>', {
			id: 'elementor-style-scheme'
		});

		elements.$previewHead = elementor.$previewContents.find( 'head' );
	};

	var initSchemes = function() {
		schemes = elementor.helpers.cloneObject( elementor.config.schemes.items );
	};

	var initStylesheet = function() {
		stylesheet = new Stylesheet();

		var breakpoints = elementorFrontend.config.breakpoints;

		jQuery.each( breakpoints, function( breakpointKey, breakpoint ) {
			stylesheet.addDevice( breakpoint.name, breakpoint.value );
		} );
	};

	var addControlCSS = function( control, controlsStack, widgetType ) {
		ControlsCSSParser.addControlStyleRules( stylesheet, control, controlsStack, function( control ) {
			return self.getSchemeValue( control.scheme.type, control.scheme.value, control.scheme.key ).value;
		}, [ '{{WRAPPER}}' ], [ settings.selectorWrapperPrefix + widgetType ] );
	};

	var addWidgetControlsCSS = function( widget ) {
		var widgetSchemeControls = self.getWidgetSchemeControls( widget );

		_.each( widgetSchemeControls, function( control ) {
			addControlCSS( control, widgetSchemeControls, widget.widget_type );
		} );
	};

	var addWidgetsSchemesCSS = function() {
		_.each( elementor.config.widgets, function( widget ) {
			addWidgetControlsCSS(  widget  );
		} );
	};

	var addBreakpointsCSS = function() {
		jQuery.each( elementorFrontend.config.breakpoints, function() {
			if ( -1 !== [ 'desktop', 'mobile' ].indexOf( this.name ) ) {
				return;
			}

			stylesheet.addRules( '.elementor:after', { content: '\'' + this.name + '\'' }, { min: this.name, max: this.name } );
		} );
	};

	this.init = function() {
		initElements();

		buildUI();

		initSchemes();

		initStylesheet();

		return self;
	};

	this.getWidgetSchemeControls = function( widget ) {
		return _.filter( widget.controls, function( control ) {
			return _.isObject( control.scheme );
		} );
	};

	this.getSchemes = function() {
		return schemes;
	};

	this.getEnabledSchemesTypes = function() {
		return elementor.config.schemes.enabled_schemes;
	};

	this.getScheme = function( schemeType ) {
		return schemes[ schemeType ];
	};

	this.getSchemeValue = function( schemeType, value, key ) {
		if ( this.getEnabledSchemesTypes().indexOf( schemeType ) < 0 ) {
			return false;
		}

		var scheme = self.getScheme( schemeType ),
			schemeValue = scheme.items[ value ];

		if ( key && _.isObject( schemeValue ) ) {
			var clonedSchemeValue = elementor.helpers.cloneObject( schemeValue );

			clonedSchemeValue.value = schemeValue.value[ key ];

			return clonedSchemeValue;
		}

		return schemeValue;
	};

	this.printSchemesStyle = function() {
		stylesheet.empty();

		addWidgetsSchemesCSS();

		addBreakpointsCSS();

		elements.$style.text( stylesheet );
	};

	this.resetSchemes = function( schemeName ) {
		schemes[ schemeName ] = elementor.helpers.cloneObject( elementor.config.schemes.items[ schemeName ] );
	};

	this.saveScheme = function( schemeName ) {
		elementor.config.schemes.items[ schemeName ].items = elementor.helpers.cloneObject( schemes[ schemeName ].items );

		var itemsToSave = {};

		_.each( schemes[ schemeName ].items, function( item, key ) {
			itemsToSave[ key ] = item.value;
		} );

		NProgress.start();

		elementor.ajax.send( 'apply_scheme', {
			data: {
				scheme_name: schemeName,
				data: JSON.stringify( itemsToSave )
			},
			success: function() {
				NProgress.done();
			}
		} );
	};

	this.setSchemeValue = function( schemeName, itemKey, value ) {
		schemes[ schemeName ].items[ itemKey ].value = value;
	};
};

module.exports = new Schemes();
