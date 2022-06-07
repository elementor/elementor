import ElementView from './element';
import PanelHeaderItemView from 'elementor-panel/header';

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
			float: '#elementor-navigator__float',
		};
	}

	events() {
		return {
			'click @ui.toggleAll': 'toggleAll',
			'click @ui.close': 'onCloseClick',
			'click @ui.float': 'onFloatClick',
		};
	}

	regions() {
		return {
			header: '#elementor-navigator__header',
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

		this.header.show( new PanelHeaderItemView() );

		this.getChildView( 'header' ).setTitle( __( 'Navigator', 'elementor' ) );
	}

	onCloseClick() {
		$e.components.get( 'navigator' ).close();
	}

	onFloatClick() {
		//TODO: use commands instead
		elementorCommon.elements.$body.addClass( 'elementor-navigator--float' );
		elementorCommon.elements.$body.removeClass( 'elementor-navigator-docked elementor-navigator-docked--left elementor-navigator-docked--right' );
	}
}
