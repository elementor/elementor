( function() {
	const WcProductEditor = {
		init() {
			this.wcNewProductEditorSwitchButton();
		},

		wcNewProductEditorSwitchButton() {
			const body = document.querySelector( 'body' ),
				that = this;

			if ( ! body ) {
				return;
			}

			const observer = new MutationObserver( function( mutationsList ) {
				for ( const mutation of mutationsList ) {
					if ( 'childList' === mutation.type ) {
						if ( mutation.addedNodes.length > 0 ) {
							if ( ! that.isWcProductEditorLoading() && ! that.isElementorButtonInjected() ) {
								that.injectElementorButton();
							}
						}
					}
				}
			} );

			observer.observe( body, {
				childList: true, subtree: true,
			} );
		},

		injectElementorButton() {
			const wcProductHeaderInner = document.querySelector( '.woocommerce-product-header__inner' );

			if ( wcProductHeaderInner ) {
				const buttonTemplate = document.querySelector( '#elementor-woocommerce-new-editor-button' ),
					tempDiv = document.createElement( 'div' );
				tempDiv.innerHTML = buttonTemplate.innerHTML;

				const button = tempDiv.firstElementChild;

				this.updateButtonStyle( button );

				wcProductHeaderInner.firstChild.append( button );
			}
		},

		updateButtonStyle( button ) {
			Object.assign( button.style,
				{ height: 'unset',
					width: 'fit-content',
				} );
			button.querySelector( '#elementor-editor-button' ).classList.replace( 'button-hero', 'button-large' );
		},

		isWcProductEditorLoading() {
			return !! document.querySelector( '.woocommerce-product-header.is-loading' );
		},

		isElementorButtonInjected() {
			return !! document.querySelector( '.woocommerce-product-header__inner #elementor-editor-button' );
		},
	};

	WcProductEditor.init();
}() );
