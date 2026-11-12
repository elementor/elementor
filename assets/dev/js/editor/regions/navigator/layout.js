import ElementView from './element';
import { applyNavigatorSearch } from './navigator-search';

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
			searchToggle: '#elementor-navigator__search-toggle',
			searchRow: '#elementor-navigator__search',
			searchInput: '#elementor-navigator__search-input',
			searchClear: '#elementor-navigator__search-clear',
		};
	}

	behaviors() {
		const behaviors = {};
		return elementor.hooks.applyFilters( 'navigator/layout/behaviors', behaviors, this );
	}

	events() {
		return {
			'click @ui.toggleButton': 'toggleElements',
			'click @ui.closeButton': 'onCloseButtonClick',
			'keyup @ui.closeButton': 'onCloseButtonKeyPress',
			'click @ui.searchToggle': 'onSearchToggleClick',
			'input @ui.searchInput': 'onSearchInput',
			'click @ui.searchClear': 'onSearchClear',
		};
	}

	regions() {
		return {
			elements: '#elementor-navigator__elements',
		};
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
		this.elements.currentView.recursiveChildInvoke( 'removePathClass' );
		this.elements.currentView.recursiveChildInvoke( 'updateSelection' );
	}

	onShow() {
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

	onSearchToggleClick() {
		const isHidden = this.ui.searchRow.hasClass( 'elementor-hidden' );

		this.ui.searchRow.toggleClass( 'elementor-hidden', ! isHidden );
		this.ui.searchToggle.attr( 'aria-expanded', isHidden ? 'true' : 'false' );
		this.$el.toggleClass( 'elementor-navigator__inner--search-open', isHidden );

		if ( isHidden ) {
			this.ui.searchInput.trigger( 'focus' );
		} else {
			this.onSearchClear();
		}
	}

	onSearchInput() {
		const value = this.ui.searchInput.val();

		this.ui.searchClear.toggleClass( 'elementor-hidden', ! value );

		applyNavigatorSearch( this.elements.currentView, value );
	}

	onSearchClear() {
		this.ui.searchInput.val( '' );
		this.ui.searchClear.addClass( 'elementor-hidden' );
		applyNavigatorSearch( this.elements.currentView, '' );
	}
}
