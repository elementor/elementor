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

	send: function( action, params ) {
		var ajaxParams = elementor.helpers.cloneObject( this.config.ajaxParams );

		ajaxParams.data = params && params.data || {};

		ajaxParams.data.action = this.config.actionPrefix + action;

		if ( params ) {
			ajaxParams.success = function( response ) {
				if ( response.success && params.success ) {
					params.success( response.data );
				}

				if ( ( ! response.success ) && params.error ) {
					params.error( response.data );
				}
			};

			if ( params.error ) {
				ajaxParams.error = function( data ) {
					params.error( data );
				};
			}
		}

		return Backbone.$.ajax( ajaxParams );
	}
};

module.exports = Ajax;
