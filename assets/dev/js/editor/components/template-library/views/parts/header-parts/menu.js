import { rovingTabindex } from 'elementor-editor-utils/keyboard-nav';

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
		rovingTabindex( {
			event,
			$items: this.ui.tabs,
			orientation: 'horizontal',
			onActivate: () => {
				// Tabs activate on arrow navigation, not Enter/Space.
			},
		} );

		// After rovingTabindex moves focus to the new tab, activate it.
		// activateTab triggers a re-render, so we must re-query the DOM afterwards.
		const $focused = jQuery( event.currentTarget.ownerDocument.activeElement );
		const targetTabName = $focused.data( 'tab' );

		if ( ! targetTabName ) {
			return;
		}

		const libraryComponent = $e.components.get( 'library' );
		if ( ! libraryComponent ) {
			return;
		}

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
	},
} );
