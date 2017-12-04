var BaseSettingsModel;

BaseSettingsModel = Backbone.Model.extend( {
	options: {},

	initialize: function( data, options ) {
		var self = this;

		if ( options ) {
			// Keep the options for cloning
			self.options = options;
		}

		self.controls = ( options && options.controls ) ? options.controls : elementor.getElementControls( self );

		self.validators = {};

		if ( ! self.controls ) {
			return;
		}

		var attrs = data || {},
			defaults = {};

		_.each( self.controls, function( field ) {
			var control = elementor.config.controls[ field.type ],
				isUIControl = -1 !== control.features.indexOf( 'ui' );

			if ( isUIControl ) {
				return;
			}

			// Check if the value is a plain object ( and not an array )
			var isMultipleControl = jQuery.isPlainObject( control.default_value );

			if ( isMultipleControl  ) {
				defaults[ field.name ] = _.extend( {}, control.default_value, field['default'] || {} );
			} else {
				defaults[ field.name ] = field['default'] || control.default_value;
			}

			if ( undefined !== attrs[ field.name ] ) {
				if ( isMultipleControl && ! _.isObject( attrs[ field.name ] ) ) {
					elementor.debug.addCustomError(
						new TypeError( 'An invalid argument supplied as multiple control value' ),
						'InvalidElementData',
						'Element `' + ( self.get( 'widgetType' ) || self.get( 'elType' ) ) + '` got <' + attrs[ field.name ] + '> as `' + field.name + '` value. Expected array or object.'
					);

					delete attrs[ field.name ];
				}
			}

			if ( undefined === attrs[ field.name ] ) {
				attrs[ field.name ] = defaults[ field.name ];
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

	getStyleControls: function( controls ) {
		var self = this;

		controls = controls || self.getActiveControls();

		return _.filter( controls, function( control ) {
			if ( control.fields ) {
				control.styleFields = self.getStyleControls( control.fields );

				return true;
			}

			return self.isStyleControl( control.name, controls );
		} );
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

	getActiveControls: function() {
		var self = this,
			controls = {};

		_.each( self.controls, function( control, controlKey ) {
			if ( elementor.helpers.isActiveControl( control, self.attributes ) ) {
				controls[ controlKey ] = control;
			}
		} );

		return controls;
	},

	clone: function() {
		return new BaseSettingsModel( elementor.helpers.cloneObject( this.attributes ), elementor.helpers.cloneObject( this.options ) );
	},

	setExternalChange: function( key, value ) {
		this.set( key, value );

		this.trigger( 'change:external', key, value )
			.trigger( 'change:external:' + key, value );
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
					if ( ( 'text' === control.type || 'textarea' === control.type ) && data[ key ] ) {
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

		return data;
	}
} );

module.exports = BaseSettingsModel;
