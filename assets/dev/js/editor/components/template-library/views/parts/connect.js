module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-connect',

	id: 'elementor-template-library-connect',

	ui: {
		connect: '.elementor-connect-popup',
		thumbnails: '#elementor-template-library-connect-thumbnails',
	},

	getTemplates( count ) {
		return elementor.templates.getTemplatesCollection()
		.filter( ( model ) => {
			return 'remote' === model.get( 'source' ) && 'page' === model.get( 'type' );
		} )
		.slice( 0, count );
	},

	onRender: function() {
		this.ui.connect.elementorConnect( {
			success: () => {
				elementor.config.connect.is_connected = true;

				// If is connecting during insert template.
				if ( this.getOption( 'model' ) ) {
					$e.run( 'library/insert-template', {
						model: this.getOption( 'model' ),
					} );
				}
			},
			error: () => {
				elementor.config.connect.is_connected = false;
			},
		} );

		this.getTemplates( 5 ).forEach( ( model ) => {
			const $thumbnail = jQuery( '<div />' );

			$thumbnail.
				addClass( 'thumbnail' )
				.css( {
					backgroundImage: `url( ${model.get( 'thumbnail' ) } )`,
				} );

			this.ui.thumbnails.append( $thumbnail );
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
