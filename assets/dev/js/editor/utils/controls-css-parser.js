var Stylesheet = require( 'elementor-editor-utils/stylesheet' ),
	ControlsCSSParser;

ControlsCSSParser = elementorModules.ViewModule.extend( {
	stylesheet: null,

	getDefaultSettings: function() {
		return {
			id: 0,
			container: null,
			settingsModel: null,
			dynamicParsing: {},
		};
	},

	getDefaultElements: function() {
		const id = `elementor-style-${ this.getSettings( 'id' ) }`;

		let $stylesheet = elementor.$previewContents.find( `#${ id }` );

		if ( ! $stylesheet.length ) {
			$stylesheet = jQuery( '<style>', { id } );
		}

		return {
			$stylesheetElement: $stylesheet,
		};
	},

	initStylesheet: function() {
		var breakpoints = elementorFrontend.config.breakpoints;

		this.stylesheet = new Stylesheet();

		this.stylesheet
			.addDevice( 'mobile', 0 )
			.addDevice( 'tablet', breakpoints.md )
			.addDevice( 'desktop', breakpoints.lg );
	},

	addStyleRules: function( styleControls, values, controls, placeholders, replacements ) {
		// If the current element contains dynamic values, parse thesex values
		const dynamicParsedValues = this.getSettings( 'settingsModel' ).parseDynamicSettings( values, this.getSettings( 'dynamicParsing' ), styleControls );

		_.each( styleControls, ( control ) => {
			if ( control.styleFields && control.styleFields.length ) {
				this.addRepeaterControlsStyleRules( values[ control.name ], control.styleFields, control.fields, placeholders, replacements );
			}

			// If a dynamic tag includes controls with CSS implementations, Take their CSS and apply it
			if ( control.dynamic?.active && values.__dynamic__?.[ control.name ] ) {
				this.addDynamicControlStyleRules( values.__dynamic__[ control.name ], control );
			}

			if ( ! control.selectors ) {
				return;
			}

			this.addControlStyleRules( control, dynamicParsedValues, controls, placeholders, replacements );
		} );
	},

	addControlStyleRules: function( control, values, controls, placeholders, replacements ) {
		let controlGlobalKey = control.name;

		if ( control.groupType ) {
			controlGlobalKey = control.groupPrefix + control.groupType;
		}

		const globalValues = this.getSettings( 'container' ).globals.attributes,
			globalValue = globalValues[ controlGlobalKey ];

		let value;

		if ( ! globalValue ) {
			value = this.getStyleControlValue( control, values );

			if ( undefined === value ) {
				return;
			}
		}

		_.each( control.selectors, ( cssProperty, selector ) => {
			var outputCssProperty;

			if ( globalValue ) {
				const propertyParts = cssProperty.split( ':' );

				const globalArgs = {};

				$e.data.commandExtractArgs( globalValue, globalArgs );

				const id = globalArgs.query.id;

				let propertyValue;

				// it's a global settings with additional controls in group.
				if ( control.groupType ) {
					const propertyName = control.name.replace( control.groupPrefix, '' ).replace( '_', '-' );

					propertyValue = `var( --e-global-${ control.groupType }-${ id }-${ propertyName } )`;
				} else {
					propertyValue = `var( --e-global-${ control.type }-${ id } )`;
				}

				outputCssProperty = propertyParts[ 0 ] + ':' + propertyValue;
			} else {
				try {
					outputCssProperty = cssProperty.replace( /{{(?:([^.}]+)\.)?([^}| ]*)(?: *\|\| *(?:([^.}]+)\.)?([^}| ]*) *)*}}/g, ( originalPhrase, controlName, placeholder, fallbackControlName, fallbackValue ) => {
						const externalControlMissing = controlName && ! controls[ controlName ];

						let parsedValue = '';

						if ( ! externalControlMissing ) {
							parsedValue = this.parsePropertyPlaceholder( control, value, controls, values, placeholder, controlName );
						}

						if ( ! parsedValue && 0 !== parsedValue ) {
							if ( fallbackValue ) {
								parsedValue = fallbackValue;

								const stringValueMatches = parsedValue.match( /^(['"])(.*)\1$/ );

								if ( stringValueMatches ) {
									parsedValue = stringValueMatches[ 2 ];
								} else if ( ! isFinite( parsedValue ) ) {
									if ( fallbackControlName && ! controls[ fallbackControlName ] ) {
										return '';
									}

									parsedValue = this.parsePropertyPlaceholder( control, value, controls, values, fallbackValue, fallbackControlName );
								}
							}

							if ( ! parsedValue && 0 !== parsedValue ) {
								if ( externalControlMissing ) {
									return '';
								}

								throw '';
							}
						}

						return parsedValue;
					} );
				} catch ( e ) {
					return;
				}
			}

			if ( _.isEmpty( outputCssProperty ) ) {
				return;
			}

			var devicePattern = /^(?:\([^)]+\)){1,2}/,
				deviceRules = selector.match( devicePattern ),
				query = {};

			if ( deviceRules ) {
				deviceRules = deviceRules[ 0 ];

				selector = selector.replace( devicePattern, '' );

				var pureDevicePattern = /\(([^)]+)\)/g,
					pureDeviceRules = [],
					matches;

				matches = pureDevicePattern.exec( deviceRules );
				while ( matches ) {
					pureDeviceRules.push( matches[ 1 ] );
					matches = pureDevicePattern.exec( deviceRules );
				}

				_.each( pureDeviceRules, ( deviceRule ) => {
					if ( 'desktop' === deviceRule ) {
						return;
					}

					var device = deviceRule.replace( /\+$/, '' ),
						endPoint = device === deviceRule ? 'max' : 'min';

					query[ endPoint ] = device;
				} );
			}

			_.each( placeholders, ( placeholder, index ) => {
				// Check if it's a RegExp
				var regexp = placeholder.source ? placeholder.source : placeholder,
					placeholderPattern = new RegExp( regexp, 'g' );

				selector = selector.replace( placeholderPattern, replacements[ index ] );
			} );

			if ( ! Object.keys( query ).length && control.responsive ) {
				query = _.pick( elementorCommon.helpers.cloneObject( control.responsive ), [ 'min', 'max' ] );

				if ( 'desktop' === query.max ) {
					delete query.max;
				}
			}

			this.stylesheet.addRules( selector, outputCssProperty, query );
		} );
	},

	parsePropertyPlaceholder: function( control, value, controls, values, placeholder, parserControlName ) {
		if ( parserControlName ) {
			control = _.findWhere( controls, { name: parserControlName } );

			value = this.getStyleControlValue( control, values );
		}

		return elementor.getControlView( control.type ).getStyleValue( placeholder, value, control );
	},

	getStyleControlValue: function( control, values ) {
		var value = values[ control.name ];

		if ( control.selectors_dictionary ) {
			value = control.selectors_dictionary[ value ] || value;
		}

		if ( ! _.isNumber( value ) && _.isEmpty( value ) ) {
			return;
		}

		return value;
	},

	addRepeaterControlsStyleRules: function( repeaterValues, repeaterControlsItems, controls, placeholders, replacements ) {
		repeaterControlsItems.forEach( ( item, index ) => {
			const itemModel = repeaterValues.models[ index ];

			this.addStyleRules(
				item,
				itemModel.attributes,
				controls,
				placeholders.concat( [ '{{CURRENT_ITEM}}' ] ),
				replacements.concat( [ '.elementor-repeater-item-' + itemModel.get( '_id' ) ] )
			);
		} );
	},

	addDynamicControlStyleRules: function( value, control ) {
		var self = this;

		elementor.dynamicTags.parseTagsText( value, control.dynamic, function( id, name, settings ) {
			var tag = elementor.dynamicTags.createTag( id, name, settings );

			if ( ! tag ) {
				return;
			}

			var tagSettingsModel = tag.model,
				styleControls = tagSettingsModel.getStyleControls();

			if ( ! styleControls.length ) {
				return;
			}

			self.addStyleRules( tagSettingsModel.getStyleControls(), tagSettingsModel.attributes, tagSettingsModel.controls, [ '{{WRAPPER}}' ], [ '#elementor-tag-' + id ] );
		} );
	},

	addStyleToDocument: function() {
		elementor.$previewContents.find( 'head' ).append( this.elements.$stylesheetElement );

		const extraCSS = elementor.hooks.applyFilters( 'editor/style/styleText', '', this.getSettings( 'container' ) );

		this.elements.$stylesheetElement.text( this.stylesheet + extraCSS );
	},

	removeStyleFromDocument: function() {
		this.elements.$stylesheetElement.remove();
	},

	onInit: function() {
		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );

		this.initStylesheet();
	},
} );

module.exports = ControlsCSSParser;
