( function() {
	var SafeLoader = function() {
		var loadErrors = [];

		this.load = function( callback ) {
			try {
				callback();
			} catch ( e ) {
				loadErrors.push( e );
			}
		};

		var popErrors = function() {
			if ( ! loadErrors.length ) {
				return;
			}

			var message = [];

			for ( var error in loadErrors ) {
				var errorMessage = loadErrors[ error ].message;

				if ( -1 === message.indexOf( errorMessage ) ) {
					message.push( errorMessage );
				}
			}

			alert( 'Elementor could not be loaded due the following errors:\n\n' + message.join( '.\n\n' ) + '.' );
		};

		setTimeout( popErrors, 2000 );
	};

	window.safeLoader = new SafeLoader();
} )();
