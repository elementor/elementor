var ImagesManager;

ImagesManager = function() {
	var _this = this;

	var cache = {};

	var debounceDelay = 300;

	var registeredItems = [];

	var getNormalizedSize = function( model ) {
		var size,
			imageSize = model.getSetting( 'image_size' ),
			customDimension = model.getSetting( 'image_custom_dimension' );

		if ( 'custom' === imageSize ) {
			if ( customDimension.width || customDimension.height ) {
				size = 'custom_' + customDimension.width + 'x' + customDimension.height;
			} else {
				return 'full';
			}
		} else {
			size = imageSize;
		}

		return size;
	};

	_this.getItem = function( model ) {
		var size = getNormalizedSize( model ),
			id =  model.getSetting( 'image' ).id;

		if ( ! size ) {
			return false;
		}

		if ( cache[ id ] && cache[ id ][ size ] ) {
			return cache[ id ][ size ];
		}

		return false;
	};

	_this.registerItem = function( model ) {
		if ( '' === model.getSetting( 'image' ).id ) {
			// It's a new dropped widget
			return;
		}

		if ( _this.getItem( model ) ) {
			// It's already in cache
			return;
		}

		registeredItems.push( model );

		_this.debounceGetRemoteItems();
	};

	_this.getRemoteItems = function() {
		var requestedItems = [],
			model,
			index;

		// It's one item, so we can render it from remote server
		if ( 1 === Object.keys( registeredItems ).length ) {
			for ( index in registeredItems ) {
				model = registeredItems[ index ];
			}

			model.renderRemoteServer();
			return;
		}

		for ( index in registeredItems ) {
			model = registeredItems[ index ];

			var size = getNormalizedSize( model ),
				id = model.getSetting( 'image' ).id,
				isFirstTime = ! cache[ id ] || 0 === Object.keys( cache[ id ] ).length;

			requestedItems.push( {
				id: id,
				size: size,
				is_first_time: isFirstTime
			} );
		}

		window.elementor.ajax.send(
			'get_images_details', {
				data: {
					items: requestedItems
				},
				success: function( data ) {
					var id,
						size;

					for ( id in data ) {
						if ( ! cache[ id ] ) {
							cache[ id ] = {};
						}

						for ( size in data[ id ] ) {
							cache[ id ][ size ] = data[ id ][ size ];
						}
					}
					registeredItems = [];
				}
			}
		);
	};

	_this.debounceGetRemoteItems = _.debounce( _this.getRemoteItems, debounceDelay );
};

module.exports = new ImagesManager();
