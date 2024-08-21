import ElementView from './element';

export default class extends Marionette.LayoutView {
	getTemplate() {
		return '#tmpl-elementor-navigator';
	}

	id() {
		return 'elementor-navigator__inner';
	}

	ui() {
		return {
			toggleButton: '#elementor-navigator__toggle-all',
			toggleButtonIcon: '#elementor-navigator__toggle-all i',
			toggleButtonA11yText: '#elementor-navigator__toggle-all span',
			closeButton: '#elementor-navigator__close',
			aiTitlesButton: '#elementor-navigator__ai-titles',
		};
	}

	events() {
		return {
			'click @ui.toggleButton': 'toggleElements',
			'click @ui.closeButton': 'onCloseButtonClick',
			'keyup @ui.closeButton': 'onCloseButtonKeyPress',
			'click @ui.aiTitlesButton': 'aiTitleClickHandler',
		};
	}

	regions() {
		return {
			elements: '#elementor-navigator__elements',
		};
	}

	aiTitleClickHandler() {
		window.location.hash = 'welcome-ai-return-to-ai-titles';
		window.addEventListener( 'hashchange', this.handleHashChange.bind( this ) );
	}

	handleHashChange() {
		if ( elementorCommon.config.library_connect?.is_connected && window.location.hash.includes( 'ai-titles' ) ) {
			window.location.hash = '';
			window.location.reload();
		}
	}

	toggleElements() {
		const state = 'expand' === this.ui.toggleButton.data( 'elementor-action' ),
			a11yText = state ? __( 'Collapse all elements', 'elementor' ) : __( 'Expand all elements', 'elementor' ),
			classes = [ 'eicon-collapse', 'eicon-expand' ];

		this.ui.toggleButton
			.data( 'elementor-action', state ? 'collapse' : 'expand' );

		this.ui.toggleButtonIcon
			.removeClass( classes[ +state ] )
			.addClass( classes[ +! state ] );

		this.ui.toggleButtonA11yText.text( a11yText );

		this.elements.currentView.recursiveChildInvoke( 'toggleList', state );
	}

	activateElementsMouseInteraction() {
		this.elements.currentView.recursiveChildInvoke( 'activateMouseInteraction' );
	}

	deactivateElementsMouseInteraction() {
		this.elements.currentView.recursiveChildInvoke( 'deactivateMouseInteraction' );
	}

	/**
	 * Recursively update elements selection in the navigator.
	 */
	updateSelection() {
		this.elements.currentView.recursiveChildInvoke( 'updateSelection' );
	}

	onShow() {
		if ( elementorCommon.config.library_connect?.is_connected ) {
			this.ui.aiTitlesButton.remove();
		}
		this.elements.show( new ElementView( {
			model: elementor.elementsModel,
		} ) );
	}

	onCloseButtonClick() {
		$e.components.get( 'navigator' ).close();
	}

	onCloseButtonKeyPress( event ) {
		const ENTER_KEY = 13;

		if ( ENTER_KEY === event.keyCode ) {
			this.onCloseButtonClick();
		}
	}
}
