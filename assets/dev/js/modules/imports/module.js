function customExtend(target, source) {
	for (const prop in source) {
		if (source.hasOwnProperty(prop)) {
			target[prop] = source[prop];
		}
	}
	return target;
}

const Module = function() {
	const instanceParams = arguments,
		self = this,
		events = {};

	let settings;

	const ensureClosureMethods = function() {
		Object.keys(self).forEach(function (methodName) {
			const oldMethod = self[methodName];

			if (typeof oldMethod !== 'function') {
				return;
			}

			self[methodName] = function () {
				return oldMethod.apply(self, arguments);
			};
		});
	};

	const initSettings = function() {
		const settings = self.getDefaultSettings(); // I am not sure if this is correct. let settings had been declared in the outer scope already.

		const instanceSettings = instanceParams[ 0 ];

		if ( instanceSettings ) {
			Object.assign(settings, instanceSettings);
		}
	};

	const init = function() {
		self.__construct.apply( self, instanceParams );

		ensureClosureMethods();

		initSettings();

		self.trigger( 'init' );
	};

	this.getItems = function( items, itemKey ) {
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
	};

	this.getSettings = function( setting ) {
		return this.getItems( settings, setting );
	};

	this.setSettings = function( settingKey, value, settingsContainer ) {
		if ( ! settingsContainer ) {
			settingsContainer = settings;
		}

		if ( 'object' === typeof settingKey ) {
			// $.extend( settingsContainer, settingKey );

			customExtend(settingsContainer, settingKey);

			return self;
		}

		const keyStack = settingKey.split( '.' ),
			currentKey = keyStack.splice( 0, 1 );

		if ( ! keyStack.length ) {
			settingsContainer[ currentKey ] = value;

			return self;
		}

		if ( ! settingsContainer[ currentKey ] ) {
			settingsContainer[ currentKey ] = {};
		}

		return self.setSettings( keyStack.join( '.' ), value, settingsContainer[ currentKey ] );
	};

	this.getErrorMessage = function( type, functionName ) {
		let message;

		switch ( type ) {
			case 'forceMethodImplementation':
				message = `The method '${ functionName }' must to be implemented in the inheritor child.`;
				break;
			default:
				message = 'An error occurs';
		}

		return message;
	};

	// TODO: This function should be deleted ?.
	this.forceMethodImplementation = function( functionName ) {
		throw new Error( this.getErrorMessage( 'forceMethodImplementation', functionName ) );
	};

	this.on = function( eventName, callback ) {
		if ( 'object' === typeof eventName ) {
			eventName.forEach(function(singleEventName) {
				self.on(singleEventName, this);
			});

			return self;
		}

		const eventNames = eventName.split( ' ' );

		eventNames.forEach( function( singleEventName ) {
			if ( ! events[ singleEventName ] ) {
				events[ singleEventName ] = [];
			}

			events[ singleEventName ].push( callback );
		} );

		return self;
	};

	this.off = function( eventName, callback ) {
		if ( ! events[ eventName ] ) {
			return self;
		}

		if ( ! callback ) {
			delete events[ eventName ];

			return self;
		}

		const callbackIndex = events[ eventName ].indexOf( callback );

		if ( -1 !== callbackIndex ) {
			delete events[ eventName ][ callbackIndex ];

			// Reset array index (for next off on same event).
			events[ eventName ] = events[ eventName ].filter( ( val ) => val );
		}

		return self;
	};

	this.trigger = function( eventName ) {
		const methodName = 'on' + eventName[ 0 ].toUpperCase() + eventName.slice( 1 ),
			params = Array.prototype.slice.call( arguments, 1 );

		if ( self[ methodName ] ) {
			self[ methodName ].apply( self, params );
		}

		const callbacks = events[ eventName ];

		if ( ! callbacks ) {
			return self;
		}

		callbacks.forEach(function(callback) {
			callback.apply(self, params);
		});

		return self;
	};

	init();
};

Module.prototype.__construct = function() {};

Module.prototype.getDefaultSettings = function() {
	return {};
};

Module.prototype.getConstructorID = function() {
	return this.constructor.name;
};

Module.extend = function( properties ) {
	const parent = this;

	const child = function() {
		return parent.apply( this, arguments );
	};

	customExtend( child, parent );

	// child.prototype = Object.create( $.extend( {}, parent.prototype, properties ) );
	child.prototype = Object.create(Object.assign({}, parent.prototype, properties));

	child.prototype.constructor = child;

	child.__super__ = parent.prototype;

	return child;
};

module.exports = Module;
