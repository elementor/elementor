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
	 * Override to avoid the default behavior to adjust the title of the row.
	 */
	getDefaults() {
		const component = $e.components.get( 'nested-elements/nested-repeater' ),
			widgetContainer = this.options.container,
			defaults = widgetContainer.model.config.defaults,
			index = widgetContainer.children.length + 1;

		return {
			_id: '',
			[ defaults.repeater_title_setting ]: component.getChildrenTitle( widgetContainer, index ),
		};
	}

	updateActiveRow() {
		let activeItemIndex = 1;

		if ( this.currentEditableChild ) {
			activeItemIndex = this.currentEditableChild.itemIndex;
		}

		$e.run( 'document/repeater/select', {
			container: this.container,
			index: activeItemIndex,
		} );
	}

	onAddChild() {
		this.updateChildIndexes();
	}
}
