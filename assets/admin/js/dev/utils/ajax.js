var Ajax;

Ajax = {
	config: {},

	initConfig: function() {
		this.config = {
			ajaxParams: {
				type: 'POST',
				url: elementor.config.ajaxurl
			},
			actionPrefix: 'elementor_'
		};
	},

	init: function() {
		this.initConfig();
	},

	send: function( action, options ) {
		var ajaxParams = elementor.helpers.cloneObject( this.config.ajaxParams );

		ajaxParams.data = options && options.data || {};


		if ( options ) {

		if ( ajaxParams.data instanceof FormData ) {
			ajaxParams.data.append( 'action', action );
		} else {
			ajaxParams.data.action = action;
		}

			ajaxParams.success = function( response ) {
				if ( response.success && options.success ) {
					options.success( response.data );
				}

				if ( ( ! response.success ) && options.error ) {
					options.error( response.data );
				}
			};

			if ( options.error ) {
				ajaxParams.error = function( data ) {
					options.error( data );
				};
			}
		}

		return Backbone.$.ajax( ajaxParams );
	}
};

module.exports = Ajax;
