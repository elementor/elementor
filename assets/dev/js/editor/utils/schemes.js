var Schemes,
	Stylesheet = require( 'elementor-editor-utils/stylesheet' ),
	ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' );

Schemes = function() {
	var self = this,
		stylesheet = new Stylesheet(),
		schemes = {},
		settings = {
			selectorWrapperPrefix: '.elementor-widget-',
		},
		elements = {};

	var buildUI = function() {
		elements.$previewHead.append( elements.$style );
	};

	var initElements = function() {
		const id = 'elementor-style-scheme';

		elements.$style = elementor.$previewContents.find( `#${ id }` );

		if ( ! elements.$style.length ) {
			elements.$style = jQuery( '<style>', { id } );
		}

		elements.$previewHead = elementor.$previewContents.find( 'head' );
	};

	var initSchemes = function() {
		schemes = elementorCommon.helpers.cloneObject( elementor.config.schemes.items );
	};

	var fetchControlStyles = function( control, controlsStack, widgetType ) {
		ControlsCSSParser.addControlStyleRules(
			stylesheet,
			control,
			controlsStack,
			( controlStyles ) => self.getSchemeValue( controlStyles.scheme.type, controlStyles.scheme.value, controlStyles.scheme.key ).value,
			[ '{{WRAPPER}}' ],
			[ settings.selectorWrapperPrefix + widgetType ],
		);
	};

	var fetchWidgetControlsStyles = function( widget ) {
		var widgetSchemeControls = self.getWidgetSchemeControls( widget );

		_.each( widgetSchemeControls, function( control ) {
			fetchControlStyles( control, widgetSchemeControls, widget.widget_type );
		} );
	};

	var fetchAllWidgetsSchemesStyle = function() {
		_.each( elementor.widgetsCache, function( widget ) {
			fetchWidgetControlsStyles( widget );
		} );
	};

	this.init = function() {
		initElements();
		buildUI();
		initSchemes();

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
			var clonedSchemeValue = elementorCommon.helpers.cloneObject( schemeValue );

			clonedSchemeValue.value = schemeValue.value[ key ];

			return clonedSchemeValue;
		}

		return schemeValue;
	};

	this.printSchemesStyle = function() {
		stylesheet.empty();

		fetchAllWidgetsSchemesStyle();

		elements.$style.text( stylesheet );
	};

	this.resetSchemes = function( schemeName ) {
		schemes[ schemeName ] = elementorCommon.helpers.cloneObject( elementor.config.schemes.items[ schemeName ] );
	};

	this.saveScheme = function( schemeName ) {
		elementor.config.schemes.items[ schemeName ].items = elementorCommon.helpers.cloneObject( schemes[ schemeName ].items );

		const itemsToSave = {};

		_.each( schemes[ schemeName ].items, function( item, key ) {
			itemsToSave[ key ] = item.value;
		} );

		return elementorCommon.ajax.addRequest( 'apply_scheme', {
			data: {
				scheme_name: schemeName,
				data: JSON.stringify( itemsToSave ),
			},
		} );
	};

	this.setSchemeValue = function( schemeName, itemKey, value ) {
		schemes[ schemeName ].items[ itemKey ].value = value;
	};

	this.addSchemeItem = function( schemeName, item, at ) {
		const scheme = schemes[ schemeName ],
			schemeKeys = Object.keys( scheme.items ),
			hasAt = undefined !== at,
			targetIndex = hasAt ? at : +( schemeKeys.slice( -1 )[ 0 ] ) || 0;

		if ( hasAt ) {
			let itemIndex = schemeKeys.length + 1;

			for ( ; itemIndex > at; itemIndex-- ) {
				scheme.items[ itemIndex ] = scheme.items[ itemIndex - 1 ];
			}
		}

		scheme.items[ targetIndex + 1 ] = item;
	};

	this.removeSchemeItem = function( schemeName, itemKey ) {
		const items = schemes[ schemeName ].items;

		while ( true ) {
			itemKey++;

			const nextItem = items[ itemKey + 1 ];

			if ( ! nextItem ) {
				delete items[ itemKey ];

				break;
			}

			items[ itemKey ] = nextItem;
		}
	};
};

module.exports = new Schemes();
