/*!
 * jQuery Serialize Object v1.0.1
 * https://github.com/cobicarmel/jquery-serialize-object/
 *
 * Copyright Kobi Zaltzberg
 * Released under the MIT license
 * https://github.com/cobicarmel/jquery-serialize-object/blob/master/LICENSE.txt
 */

(function( $ ) {
	
	$.fn.elementorSerializeObject = function() {
		var serializedArray = this.serializeArray(),
			data = {};

		var parseObject = function( dataContainer, key, value ) {
			var isArrayKey = /^[^\[\]]+\[]/.test( key ),
				isObjectKey = /^[^\[\]]+\[[^\[\]]+]/.test( key ),
				keyName = key.replace( /\[.*/, '' );

			if ( isArrayKey ) {
				if ( !dataContainer[ keyName ] ) {
					dataContainer[ keyName ] = [];
				}
			}
			else {
				if ( ! isObjectKey ) {
					if ( dataContainer.push ) {
						dataContainer.push( value );
					}
					else {
						dataContainer[ keyName ] = value;
					}

					return;
				}

				if ( ! dataContainer[ keyName ] ) {
					dataContainer[ keyName ] = {};
				}
			}

			var nextKeys = key.match( /\[[^\[\]]*]/g );

			nextKeys[ 0 ] = nextKeys[ 0 ].replace( /\[|]/g, '' );

			return parseObject( dataContainer[ keyName ], nextKeys.join( '' ), value );
		};

		$.each( serializedArray, function() {
			parseObject( data, this.name, this.value );
		} );
		return data;
	};
})( jQuery );
