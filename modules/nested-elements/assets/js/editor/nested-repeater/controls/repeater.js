/**
 * @extends ControlRepeaterItemView
 */
export default class Repeater extends elementor.modules.controls.Repeater {
	className() {
		// To not break panel view CSS.
		return super.className().replace( 'nested-elements-repeater', 'repeater' );
	}

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
