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
			toggleAll: '#elementor-navigator__toggle-all',
			close: '#elementor-navigator__close',
		};
	}

	events() {
		return {
			'click @ui.toggleAll': 'toggleAll',
			'click @ui.close': 'onCloseClick',
		};
	}

	regions() {
		return {
			elements: '#elementor-navigator__elements',
		};
	}

	toggleAll() {
		const state = 'expand' === this.ui.toggleAll.data( 'elementor-action' ),
			classes = [ 'eicon-collapse', 'eicon-expand' ];

		this.ui.toggleAll
			.data( 'elementor-action', state ? 'collapse' : 'expand' )
			.removeClass( classes[ +state ] )
			.addClass( classes[ +! state ] );

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
		this.elements.show( new ElementView( {
			model: elementor.elementsModel,
		} ) );
	}

	onCloseClick() {
		$e.components.get( 'navigator' ).close();
	}
}
