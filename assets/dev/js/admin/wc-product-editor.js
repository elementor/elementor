( function() {
	const WcProductEditor = {
		init() {
			this.getDefaultSettings();
			this.wcNewProductEditorSwitchButton();
		},

		getDefaultSettings() {
			this.selectors = {
				wcProductHeaderInner: '.woocommerce-product-header__inner',
				buttonTemplate: '#elementor-woocommerce-new-editor-button',
				wcLoader: '.woocommerce-product-header[role="region"]',
				wcEditButton: '.woocommerce-product-header__inner #elementor-editor-button',
				body: 'body',
			};
		},

		wcNewProductEditorSwitchButton() {
			const body = document.querySelector( this.selectors.body ),
				that = this;

			if ( ! body ) {
				return;
			}

			const observer = new MutationObserver( function( mutationsList ) {
				for ( const mutation of mutationsList ) {
					if ( 'childList' === mutation.type ) {
						if ( mutation.addedNodes.length > 0 ) {
							if ( that.isWcProductEditorLoading() && ! that.isElementorButtonInjected() ) {
								that.injectElementorButton();
								observer.disconnect();
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
			const wcProductHeaderInner = document.querySelector( this.selectors.wcProductHeaderInner );

			if ( wcProductHeaderInner ) {
				const buttonTemplate = document.querySelector( this.selectors.buttonTemplate ),
					tempDiv = document.createElement( 'div' );
				tempDiv.innerHTML = buttonTemplate.innerHTML;

				const button = tempDiv.firstElementChild;

				wcProductHeaderInner.firstChild.append( button );
			}
		},

		isWcProductEditorLoading() {
			return !! document.querySelector( this.selectors.wcLoader );
		},

		isElementorButtonInjected() {
			return !! document.querySelector( this.selectors.wcEditButton );
		},
	};

	WcProductEditor.init();
}() );
