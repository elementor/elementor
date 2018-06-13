var BaseSettingsModel;

BaseSettingsModel = Backbone.Model.extend( {
	options: {},

	initialize: function( data, options ) {
		var self = this;

		// Keep the options for cloning
		self.options = options;

		self.controls = elementor.mergeControlsSettings( options.controls );

		self.validators = {};

		if ( ! self.controls ) {
			return;
		}

		var attrs = data || {},
			defaults = {};

		_.each( self.controls, function( control ) {
			var isUIControl = -1 !== control.features.indexOf( 'ui' );

			if ( isUIControl ) {
				return;
			}
			var controlName = control.name;

			defaults[ controlName ] = control['default'];

			var isDynamicControl = control.dynamic && control.dynamic.active,
				hasDynamicSettings = isDynamicControl && attrs.__dynamic__ && attrs.__dynamic__[ controlName ];

			if ( isDynamicControl && ! hasDynamicSettings && control.dynamic['default'] ) {
				if ( ! attrs.__dynamic__ ) {
					attrs.__dynamic__ = {};
				}

				attrs.__dynamic__[ controlName ] = control.dynamic['default'];

				hasDynamicSettings = true;
			}

			// Check if the value is a plain object ( and not an array )
			var isMultipleControl = jQuery.isPlainObject( control['default'] );

			if ( undefined !== attrs[ controlName ] && isMultipleControl && ! _.isObject( attrs[ controlName ] ) && ! hasDynamicSettings ) {
				elementor.debug.addCustomError(
					new TypeError( 'An invalid argument supplied as multiple control value' ),
					'InvalidElementData',
					'Element `' + ( self.get( 'widgetType' ) || self.get( 'elType' ) ) + '` got <' + attrs[ controlName ] + '> as `' + controlName + '` value. Expected array or object.'
				);

				delete attrs[ controlName ];
			}

			if ( undefined === attrs[ controlName ] ) {
				attrs[ controlName ] = defaults[ controlName ];
			}
		} );

		self.defaults = defaults;

		self.handleRepeaterData( attrs );

		self.set( attrs );
	},

	handleRepeaterData: function( attrs ) {
		_.each( this.controls, function( field ) {
			if ( field.is_repeater ) {
				// TODO: Apply defaults on each field in repeater fields
				if ( ! ( attrs[ field.name ] instanceof Backbone.Collection ) ) {
					attrs[ field.name ] = new Backbone.Collection( attrs[ field.name ], {
						model: function( attrs, options ) {
							options = options || {};

							options.controls = field.fields;

							if ( ! attrs._id ) {
								attrs._id = elementor.helpers.getUniqueID();
							}

							return new BaseSettingsModel( attrs, options );
						}
					} );
				}
			}
		} );
	},

	getFontControls: function() {
		return _.filter( this.getActiveControls(), function( control ) {
			return 'font' === control.type;
		} );
	},

	getStyleControls: function( controls, attributes ) {
		var self = this;

		controls = elementor.helpers.cloneObject( self.getActiveControls( controls, attributes ) );

		var styleControls = [];

		jQuery.each( controls, function() {
			var control = this,
				controlDefaultSettings = elementor.config.controls[ control.type ];

			control = jQuery.extend( {}, controlDefaultSettings, control );

			if ( control.fields ) {
				var styleFields = [];

				self.attributes[ control.name ].each( function( item ) {
					styleFields.push( self.getStyleControls( control.fields, item.attributes ) );
				} );

				control.styleFields = styleFields;
			}

			if ( control.fields || ( control.dynamic && control.dynamic.active ) || self.isStyleControl( control.name, controls ) ) {
				styleControls.push( control );
			}
		} );

		return styleControls;
	},

	isStyleControl: function( attribute, controls ) {
		controls = controls || this.controls;

		var currentControl = _.find( controls, function( control ) {
			return attribute === control.name;
		} );

		return currentControl && ! _.isEmpty( currentControl.selectors );
	},

	getClassControls: function( controls ) {
		controls = controls || this.controls;

		return _.filter( controls, function( control ) {
			return ! _.isUndefined( control.prefix_class );
		} );
	},

	isClassControl: function( attribute ) {
		var currentControl = _.find( this.controls, function( control ) {
			return attribute === control.name;
		} );

		return currentControl && ! _.isUndefined( currentControl.prefix_class );
	},

	getControl: function( id ) {
		return _.find( this.controls, function( control ) {
			return id === control.name;
		} );
	},

	getActiveControls: function( controls, attributes ) {
		var activeControls = {};

		if ( ! controls ) {
			controls = this.controls;
		}

		if ( ! attributes ) {
			attributes = this.attributes;
		}

		_.each( controls, function( control, controlKey ) {
			if ( elementor.helpers.isActiveControl( control, attributes ) ) {
				activeControls[ controlKey ] = control;
			}
		} );

		return activeControls;
	},

	clone: function() {
		return new BaseSettingsModel( elementor.helpers.cloneObject( this.attributes ), elementor.helpers.cloneObject( this.options ) );
	},

	setExternalChange: function( key, value ) {
		this.set( key, value );

		this.trigger( 'change:external', key, value )
			.trigger( 'change:external:' + key, value );
	},

	parseDynamicSettings: function( settings, options, controls ) {
		var self = this;

		settings = elementor.helpers.cloneObject( settings || self.attributes );

		options = options || {};

		controls = controls || this.controls;

		jQuery.each( controls, function() {
			var control = this,
				valueToParse;

			if ( 'repeater' === control.type ) {
				valueToParse = settings[ control.name ];
				valueToParse.forEach( function( value, key ) {
					valueToParse[ key ] = self.parseDynamicSettings( value, options, control.fields );
				} );

				return;
			}

			valueToParse = settings.__dynamic__ && settings.__dynamic__[ control.name ];

			if ( ! valueToParse ) {
				return;
			}

			var dynamicSettings = control.dynamic;

			if ( undefined === dynamicSettings ) {
				dynamicSettings = elementor.config.controls[ control.type ].dynamic;
			}

			if ( ! dynamicSettings || ! dynamicSettings.active ) {
				return;
			}

			var dynamicValue;

			try {
				dynamicValue = elementor.dynamicTags.parseTagsText( valueToParse, dynamicSettings, elementor.dynamicTags.getTagDataContent );
			} catch ( error ) {
				if ( elementor.dynamicTags.CACHE_KEY_NOT_FOUND_ERROR !== error.message ) {
					throw error;
				}

				dynamicValue = '';

				if ( options.onServerRequestStart ) {
					options.onServerRequestStart();
				}

				elementor.dynamicTags.refreshCacheFromServer( function() {
					if ( options.onServerRequestEnd ) {
						options.onServerRequestEnd();
					}
				} );
			}

			if ( dynamicSettings.property ) {
				settings[ control.name ][ dynamicSettings.property ] = dynamicValue;
			} else {
				settings[ control.name ] = dynamicValue;
			}
		} );

		return settings;
	},

	toJSON: function( options ) {
		var data = Backbone.Model.prototype.toJSON.call( this );

		options = options || {};

		delete data.widgetType;
		delete data.elType;
		delete data.isInner;

		_.each( data, function( attribute, key ) {
			if ( attribute && attribute.toJSON ) {
				data[ key ] = attribute.toJSON();
			}
		} );

		if ( options.removeDefault ) {
			var controls = this.controls;

			_.each( data, function( value, key ) {
				var control = controls[ key ];

				if ( control ) {
					// TODO: use `save_default` in text|textarea controls.
					if ( control.save_default || ( ( 'text' === control.type || 'textarea' === control.type ) && data[ key ] ) ) {
						return;
					}

					if ( data[ key ] && 'object' === typeof data[ key ] ) {
						// First check length difference
						if ( Object.keys( data[ key ] ).length !== Object.keys( control[ 'default' ] ).length ) {
							return;
						}

						// If it's equal length, loop over value
						var isEqual = true;

						_.each( data[ key ], function( propertyValue, propertyKey ) {
							if ( data[ key ][ propertyKey ] !== control[ 'default' ][ propertyKey ] ) {
								return isEqual = false;
							}
						} );

						if ( isEqual ) {
							delete data[ key ];
						}
					} else {
						if ( data[ key ] === control[ 'default' ] ) {
							delete data[ key ];
						}
					}
				}
			} );
		}

		return elementor.helpers.cloneObject( data );
	}
} );

module.exports = BaseSettingsModel;
