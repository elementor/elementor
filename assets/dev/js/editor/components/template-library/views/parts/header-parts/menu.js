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
			case 'ArrowLeft':
				event.preventDefault();
				targetIndex = currentIndex > 0 ? currentIndex - 1 : $tabs.length - 1;
				break;
			case 'ArrowRight':
				event.preventDefault();
				targetIndex = currentIndex < $tabs.length - 1 ? currentIndex + 1 : 0;
				break;
			case 'Home':
				event.preventDefault();
				targetIndex = 0;
				break;
			case 'End':
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
					libraryComponent.activateTab( targetTabName );
					$targetTab.focus();
				}
			}
		}
	},
} );
