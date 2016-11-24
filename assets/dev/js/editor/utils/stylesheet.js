( function( $ ) {

	var Stylesheet = function() {
		var self = this,
			rules = {},
			devices = {};

		var getDeviceMaxValue = function( deviceName ) {
			var deviceNames = Object.keys( devices ),
				deviceNameIndex = deviceNames.indexOf( deviceName ),
				nextIndex = deviceNameIndex + 1;

			if ( nextIndex >= deviceNames.length ) {
				throw new RangeError( 'Max value for this device is out of range.' );
			}

			return devices[ deviceNames[ nextIndex ] ] - 1;
		};

		var queryToHash = function( query ) {
			var hash = [];

			$.each( query, function( endPoint ) {
				hash.push( endPoint + '_' + this );
			} );

			return hash.join( '-' );
		};

		var hashToQuery = function( hash ) {
			var query = {};

			hash = hash.split( '-' ).filter( String );

			hash.forEach( function( singleQuery ) {
				var queryParts = singleQuery.split( '_' ),
					endPoint = queryParts[0],
					deviceName = queryParts[1];

				query[ endPoint ] = 'max' === endPoint ? getDeviceMaxValue( deviceName ) : devices[ deviceName ];
			} );

			return query;
		};

		var addQueryHash = function( queryHash ) {
			rules[ queryHash ] = {};

			var hashes = Object.keys( rules );

			if ( hashes.length < 2 ) {
				return;
			}

			// Sort the devices from narrowest to widest
			hashes.sort( function( a, b ) {
				if ( 'all' === a ) {
					return -1;
				}

				if ( 'all' === b ) {
					return 1;
				}

				var aQuery = hashToQuery( a ),
					bQuery = hashToQuery( b );

				return bQuery.max - aQuery.max;
			} );

			var sortedRules = {};

			hashes.forEach( function( deviceName ) {
				sortedRules[ deviceName ] = rules[ deviceName ];
			} );

			rules = sortedRules;
		};

		var getQueryHashStyleFormat = function( queryHash ) {
			var query = hashToQuery( queryHash ),
				styleFormat = [];

			$.each( query, function( endPoint ) {
				styleFormat.push( '(' + endPoint + '-width:' + this + 'px)' );
			} );

			return '@media' + styleFormat.join( ' and ' );
		};

		this.addDevice = function( deviceName, deviceValue ) {
			devices[ deviceName ] = deviceValue;

			var deviceNames = Object.keys( devices );

			if ( deviceNames.length < 2 ) {
				return self;
			}

			// Sort the devices from narrowest to widest
			deviceNames.sort( function( a, b ) {
				return devices[ a ] - devices[ b ];
			} );

			var sortedDevices = {};

			deviceNames.forEach( function( deviceName ) {
				sortedDevices[ deviceName ] = devices[ deviceName ];
			} );

			devices = sortedDevices;

			return self;
		};

		this.addRules = function( selector, styleRules, query ) {
			var queryHash = 'all';

			if ( query ) {
				queryHash = queryToHash( query );
			}

			if ( ! rules[ queryHash ] ) {
				addQueryHash( queryHash );
			}

			if ( ! styleRules ) {
				var parsedRules = selector.match( /[^\s\\].+?(?=\{)\{.+?(?=})}/g );

				$.each( parsedRules, function() {
					var parsedRule = this.match( /(.+?(?=\{))\{(.+?(?=}))}/ );

					self.addRules( parsedRule[1], parsedRule[2], query );
				} );

				return;
			}

			if ( ! rules[ queryHash ][ selector ] ) {
				rules[ queryHash ][ selector ] = {};
			}

			if ( 'string' === typeof styleRules ) {
				styleRules = styleRules.split( ';' ).filter( String );

				var orderedRules = {};

				$.each( styleRules, function() {
					var property = this.split( /:(.*)?/ );

					orderedRules[ property[0].trim() ] = property[1].trim().replace( ';', '' );
				} );

				styleRules = orderedRules;
			}

			$.extend( rules[ queryHash ][ selector ], styleRules );

			return self;
		};

		this.getRules = function() {
			return rules;
		};

		this.empty = function() {
			rules = {};
		};

		this.toString = function() {
			var styleText = '';

			$.each( rules, function( queryHash ) {
				var deviceText = Stylesheet.parseRules( this );

				if ( 'all' !== queryHash ) {
					deviceText = getQueryHashStyleFormat( queryHash ) + '{' + deviceText + '}';
				}

				styleText += deviceText;
			} );

			return styleText;
		};
	};

	Stylesheet.parseRules = function( rules ) {
		var parsedRules = '';

		$.each( rules, function( selector ) {
			var selectorContent = Stylesheet.parseProperties( this );

			if ( selectorContent ) {
				parsedRules += selector + '{' + selectorContent + '}';
			}
		} );

		return parsedRules;
	};

	Stylesheet.parseProperties = function( properties ) {
		var parsedProperties = '';

		$.each( properties, function( propertyKey ) {
			if ( this ) {
				parsedProperties += propertyKey + ':' + this + ';';
			}
		} );

		return parsedProperties;
	};

	module.exports = Stylesheet;
} )( jQuery );
