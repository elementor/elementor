var ImagesManager;

ImagesManager = function () {

	var _this = this;

	var cache = {};

	var debounceDelay = 300;

	var registeredItems = [];

	var getNormalizedSize = function ( obj ) {

		var size,
			image_size = obj.settings.image_size,
			custom_dimension = obj.settings.image_custom_dimension;

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

	_this.getItem = function ( obj ) {

		var size = getNormalizedSize( obj ),
			id = obj.settings.image.id;

		if ( ! size ) {
			return false;
		}

		if ( cache[ id ] && cache[ id ][ size ] ) {

			obj.settings.image.url = cache[ id ][ size ];

			return cache[ id ][ size ];
		}

		return false;
	};

	_this.registerItem = function ( obj ) {

		if ( '' === obj.settings.image.id ) {
			// It's a new dropped widget
			return;
		}

		if ( _this.getItem( obj ) ) {
			// It's already in cache
			return;
		}



		registeredItems.push( obj );

		_this.debounceGetRemoteItems();

	};

	_this.getRemoteItems = function () {

		var requestedItems = [];

		/* it's one item, so we can render it from remote server */
		if ( 1 === Object.keys( registeredItems ).length ) {

			for ( var index in registeredItems ) {
				var obj = registeredItems[ index ];
			}



			obj.model.renderRemoteServer();
			return;
		}

		for ( var index in registeredItems ) {

			var obj = registeredItems[ index ],
				size = getNormalizedSize( obj ),
				id = obj.settings.image.id,
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

					for ( var index in registeredItems ) {
						delete registeredItems[ index ];
					}
				}
			}
		);
	};

	_this.debounceGetRemoteItems = _.debounce( _this.getRemoteItems, debounceDelay );
};

module.exports = new ImagesManager();
