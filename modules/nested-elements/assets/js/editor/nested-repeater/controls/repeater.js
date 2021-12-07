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
	 * Override to avoid the default behavior which applied via `editSettings.set( 'activeItemIndex', index )`.
	 * Since default behavior does not save history.
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
