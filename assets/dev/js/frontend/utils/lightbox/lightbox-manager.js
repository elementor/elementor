export default class extends elementorModules.ViewModule {
	static getLightbox() {
		return new Promise( ( resolve ) => {
			import(
				/* webpackChunkName: 'lightbox' */
				`elementor-frontend/utils/lightbox/lightbox`
				).then( ( { default: LightboxModule } ) => {
				resolve( new LightboxModule() );
			} );
		} );
	}

	getDefaultSettings() {
		return {
			selectors: {
				links: 'a, [data-elementor-lightbox]',
			},
		};
	}

	getDefaultElements() {
		return {
			$links: jQuery( this.getSettings( 'selectors.links' ) ),
		};
	}

	isLightboxLink( element ) {
		if ( 'A' === element.tagName && ( element.hasAttribute( 'download' ) || ! /^[^?]+\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test( element.href ) ) ) {
			return false;
		}

		const generalOpenInLightbox = elementorFrontend.getKitSettings( 'global_image_lightbox' ),
			currentLinkOpenInLightbox = element.dataset.elementorOpenLightbox;

		return 'yes' === currentLinkOpenInLightbox || ( generalOpenInLightbox && 'no' !== currentLinkOpenInLightbox );
	}

	async onLinkClick( event ) {
		const element = event.currentTarget,
			$target = jQuery( event.target ),
			editMode = elementorFrontend.isEditMode(),
			isClickInsideElementor = ! ! $target.closest( '.elementor-edit-area' ).length;

		if ( ! this.isLightboxLink( element ) ) {
			if ( editMode && isClickInsideElementor ) {
				event.preventDefault();
			}

			return;
		}

		event.preventDefault();

		if ( editMode && ! elementor.getPreferences( 'lightbox_in_editor' ) ) {
			return;
		}

		const lightbox = this.isOptimizedAssetsLoading() ? await this.constructor.getLightbox() : elementorFrontend.utils.lightbox;

		lightbox.createLightbox( element );
	}

	isOptimizedAssetsLoading() {
		return elementorFrontend.config.experimentalFeatures.e_optimized_assets_loading;
	}

	bindEvents() {
		elementorFrontend.elements.$document.on(
			'click',
			this.getSettings( 'selectors.links' ),
			( event ) => this.onLinkClick( event )
		);
	}

	onInit( ...args ) {
		super.onInit( ...args );

		if ( ! this.isOptimizedAssetsLoading() || elementorFrontend.isEditMode() ) {
			return;
		}

		// Detecting lightbox links on init will reduce the time of waiting to the lightbox to be display on slow connections.
		this.elements.$links.each( ( index, element ) => {
			if ( this.isLightboxLink( element ) ) {
				this.constructor.getLightbox();

				// Breaking the iteration when the library loading has already been triggered.
				return false;
			}
		} );
	}
}
