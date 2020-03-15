class ModuleBase {
	settings = {};
	events = {};

	constructor( ... args ) {
		this.args = args;
	}

	// BC?
	__construct( ... args ) {

	}

	init() {
		this.__construct( this.args );

		this.ensureClosureMethods();

		this.initSettings();

		this.trigger( 'init' );
	}

	initSettings() {
		this.settings = this.getDefaultSettings();

		if ( this.args[ 0 ] ) {
			jQuery.extend( true, this.settings, this.args[ 0 ] );
		}
	}

	getItems( items, itemKey ) {
		if ( itemKey ) {
			const keyStack = itemKey.split( '.' ),
				currentKey = keyStack.splice( 0, 1 );

			if ( ! keyStack.length ) {
				return items[ currentKey ];
			}

			if ( ! items[ currentKey ] ) {
				return;
			}

			return this.getItems( items[ currentKey ], keyStack.join( '.' ) );
		}

		return items;
	}

	getSettings( setting ) {
		return this.getItems( this.settings, setting );
	}

	getModuleName() {
		return this.getConstructorID();
	}

	getDefaultSettings() {
		return {};
	}

	getConstructorID() {
		return this.constructor.name;
	}

	setSettings( settingKey, value, settingsContainer ) {
		if ( ! settingsContainer ) {
			settingsContainer = this.settings;
		}

		if ( 'object' === typeof settingKey ) {
			jQuery.extend( settingsContainer, settingKey );

			return this;
		}

		const keyStack = settingKey.split( '.' ),
			currentKey = keyStack.splice( 0, 1 );

		if ( ! keyStack.length ) {
			settingsContainer[ currentKey ] = value;

			return this;
		}

		if ( ! settingsContainer[ currentKey ] ) {
			settingsContainer[ currentKey ] = {};
		}

		return this.setSettings( keyStack.join( '.' ), value, settingsContainer[ currentKey ] );
	}

	ensureClosureMethods() {
		jQuery.each( this, ( methodName ) => {
			const oldMethod = this[ methodName ];

			if ( 'function' !== typeof oldMethod ) {
				return;
			}

			this[ methodName ] = () => {
				return oldMethod.apply( this, arguments );
			};
		} );
	}

	forceMethodImplementation() {
		// TODO Should be `elementorUtils.forceMethodImplementation`
		return elementorModules.forceMethodImplementation();
	}

	on( eventName, callback ) {
		const self = this;

		if ( 'object' === typeof eventName ) {
			jQuery.each( eventName, function( singleEventName ) {
				self.on( singleEventName, this );
			} );

			return self;
		}

		const eventNames = eventName.split( ' ' );

		eventNames.forEach( ( singleEventName ) => {
			if ( ! this.events[ singleEventName ] ) {
				this.events[ singleEventName ] = [];
			}

			this.events[ singleEventName ].push( callback );
		} );

		return self;
	}

	off( eventName, callback ) {
		if ( ! this.events[ eventName ] ) {
			return this;
		}

		if ( ! callback ) {
			delete this.events[ eventName ];

			return this;
		}

		const callbackIndex = this.events[ eventName ].indexOf( callback );

		if ( -1 !== callbackIndex ) {
			delete this.events[ eventName ][ callbackIndex ];

			// Reset array index (for next off on same event).
			this.events[ eventName ] = this.events[ eventName ].filter( ( val ) => val );
		}

		return this;
	}

	trigger( eventName ) {
		const methodName = 'on' + eventName[ 0 ].toUpperCase() + eventName.slice( 1 ),
			params = Array.prototype.slice.call( arguments, 1 );

		if ( this[ methodName ] ) {
			this[ methodName ].apply( this, params );
		}

		const callbacks = this.events[ eventName ];

		if ( ! callbacks ) {
			return this;
		}

		jQuery.each( callbacks, ( index, callback ) => {
			callback.apply( this, params );
		} );

		return this;
	}
}

ModuleBase.extend = function( properties ) {
	const child = function() {
		return parent.apply( this, arguments );
	},
		parent = this;

	jQuery.extend( child, parent );

	child.prototype = Object.create( jQuery.extend( {}, parent.prototype, properties ) );

	child.prototype.constructor = child;

	child.__super__ = parent.prototype;

	return child;
};

export default ModuleBase;
