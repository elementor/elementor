const KEYBOARD_KEYS = {
	ARROW_LEFT: 'ArrowLeft',
	ARROW_RIGHT: 'ArrowRight',
	HOME: 'Home',
	END: 'End',
};

module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-menu',

	id: 'elementor-template-library-header-menu',

	ui: {
		tabs: '[role="tab"]',
	},

	events: {
		'keydown @ui.tabs': 'onTabKeyDown',
	},

	templateHelpers() {
		return {
			tabs: $e.components.get( 'library' ).getTabs(),
		};
	},

	attributes() {
		return {
			role: 'tablist',
			'aria-label': __( 'Library sections', 'elementor' ),
		};
	},

	onTabKeyDown( event ) {
		const $tabs = this.ui.tabs;
		const $currentTab = jQuery( event.currentTarget );
		const currentIndex = $tabs.index( $currentTab );
		let targetIndex = -1;

		switch ( event.key ) {
			case KEYBOARD_KEYS.ARROW_LEFT:
				event.preventDefault();
				targetIndex = currentIndex > 0 ? currentIndex - 1 : $tabs.length - 1;
				break;
			case KEYBOARD_KEYS.ARROW_RIGHT:
				event.preventDefault();
				targetIndex = currentIndex < $tabs.length - 1 ? currentIndex + 1 : 0;
				break;
			case KEYBOARD_KEYS.HOME:
				event.preventDefault();
				targetIndex = 0;
				break;
			case KEYBOARD_KEYS.END:
				event.preventDefault();
				targetIndex = $tabs.length - 1;
				break;
			default:
				return;
		}

		if ( targetIndex >= 0 && targetIndex < $tabs.length ) {
			const $targetTab = $tabs.eq( targetIndex );
			const targetTabName = $targetTab.data( 'tab' );

			if ( targetTabName ) {
				const libraryComponent = $e.components.get( 'library' );
				if ( libraryComponent ) {
					try {
						libraryComponent.activateTab( targetTabName );

						const $tabAfterRerender = jQuery( `#elementor-template-library-header-menu [data-tab="${ targetTabName }"]` );
						if ( $tabAfterRerender.length ) {
							$tabAfterRerender.trigger( 'focus' );
						}
					} catch ( error ) {
						// eslint-disable-next-line no-console
						console.error( 'Tab activation failed:', error );
					}
				}
			}
		}
	},
} );
