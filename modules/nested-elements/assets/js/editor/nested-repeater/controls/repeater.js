/**
 * @extends ControlRepeaterItemView
 */
export default class Repeater extends elementor.modules.controls.Repeater {
	className() {
		// Repeater Panel CSS, depends on 'elementor-control-type-repeater` control.
		// `elementor-control-type-nested-elements-repeater` to `elementor-control-type-repeater`
		return super.className().replace( 'nested-elements-repeater', 'repeater' );
	}

	/**
	 * @inheritDoc
	 * Since the default is controlled via silent setSettings, override this method to avoid the default behavior.
	 * Use command 'nested-elements/nested-repeater/select' instead.
	 */
	updateActiveRow() {
		let activeItemIndex = 1;

		if ( this.currentEditableChild ) {
			activeItemIndex = this.currentEditableChild.itemIndex;
		}

		$e.run( 'nested-elements/nested-repeater/select', {
			container: this.container,
			index: activeItemIndex,
		} );
	}
}
