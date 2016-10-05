var ImagesManager;

ImagesManager = function () {

	var _this = this;

	var cache = {};

	var debounceDelay = 300;

	var registeredItems = [];

	var getNormalizedSize = function ( model ) {

		var size,
			image_size = model.getSetting( 'image_size' ),
			custom_dimension = model.getSetting( 'image_custom_dimension' );

		if ( 'custom' === image_size ) {

			if ( custom_dimension.width || custom_dimension.height ) {
				size = 'custom_' + custom_dimension.width + 'x' + custom_dimension.height;
			}
			else {
				return 'full';
			}
		}
		else {
			size = image_size;
		}

		return size;
	};

	_this.getItem = function ( model ) {

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

	_this.registerItem = function ( model ) {

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

	_this.getRemoteItems = function () {

		var requestedItems = [];

		/* it's one item, so we can render it from remote server */
		if ( 1 === Object.keys( registeredItems ).length ) {

			for ( var index in registeredItems ) {
				var model = registeredItems[ index ];
			}

			model.renderRemoteServer();
			return;
		}

		for ( var index in registeredItems ) {

			var model = registeredItems[ index ],
				size = getNormalizedSize( model ),
				id = model.getSetting( 'image' ).id,
				is_first_time = ! cache[ id ] || 0 === Object.keys( cache[ id ] ).length;

			requestedItems.push(
				{
					id           : id,
					size         : size,
					is_first_time: is_first_time
				}
			);
		}

		window.elementor.ajax.send(
			'get_images_details', {
				data   : {
					items: requestedItems
				},
				success: function ( data ) {
					for ( var id in data ) {

						if ( ! cache[ id ] ) {
							cache[ id ] = {};
						}

						for ( var size in data[ id ] ) {
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
