module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-connect',

	id: 'elementor-template-library-connect',

	ui: {
		connect: '.elementor-connect-popup',
		thumbnails: '#elementor-template-library-connect-thumbnails',
	},

	onRender: function() {
		this.ui.connect.elementorConnect( {
			success: () => {
				elementor.config.library_connect.is_connected = true;

				// If is connecting during insert template.
				if ( this.getOption( 'model' ) ) {
					$e.run( 'library/insert-template', {
						model: this.getOption( 'model' ),
					} );
				}
			},
			error: () => {
				elementor.config.library_connect.is_connected = false;
			},
		} );

		this.ui.thumbnails.find( '.thumbnail' ).each( ( index, el ) => {
			setTimeout( () => {
				jQuery( el ).css( {
					marginTop: '100px',
					opacity: 1,
				} );
			}, index * 100 );
		} );
	},
} );
