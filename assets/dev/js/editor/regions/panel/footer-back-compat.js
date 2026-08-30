/**
 * Back-compat stub for the removed Editor v1 panel footer (ED-24856).
 *
 * Elementor Pro < 4.3 still hooks Theme Builder / Popup UI through
 * `elementor.getPanelView().footer.currentView`. Without this stub, opening
 * those documents throws and leaves the editor stuck loading (ED-25418).
 */
const StubFooterSaverBehavior = Marionette.Behavior.extend( {
	ui() {
		return {
			buttonPreview: '.elementor-panel-footer-back-compat-preview',
		};
	},

	onRender() {
		if ( ! this.ui.buttonPreview.tipsy ) {
			this.ui.buttonPreview.tipsy = () => this.ui.buttonPreview;
		}
	},
} );

module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-footer-back-compat',

	className: 'elementor-panel-footer-back-compat',

	attributes: {
		'aria-hidden': 'true',
	},

	behaviors() {
		return {
			saver: {
				behaviorClass: StubFooterSaverBehavior,
			},
		};
	},

	addSubMenuItem( subMenuName, itemData ) {
		const $newItem = jQuery( '<div>', {
			id: 'elementor-panel-footer-sub-menu-item-' + itemData.name,
			class: 'elementor-panel-footer-sub-menu-item',
		} );

		if ( itemData.callback ) {
			$newItem.on( 'click', itemData.callback );
		}

		return $newItem;
	},

	removeSubMenuItem( subMenuName, itemData ) {
		return jQuery( '#elementor-panel-footer-sub-menu-item-' + itemData.name ).remove();
	},
} );
