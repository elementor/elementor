import { extractNestedItemTitle } from 'elementor/modules/nested-elements/assets/js/editor/utils';

export default class Repeater extends elementor.modules.controls.Repeater {
	className() {
		// Repeater Panel CSS, depends on 'elementor-control-type-repeater` control.
		// `elementor-control-type-nested-elements-repeater` to `elementor-control-type-repeater`
		return super.className().replace( 'nested-elements-repeater', 'repeater' );
	}

	/**
	 * Override to avoid the default behavior to adjust the title of the row.
	 *
	 * @return {Object}
	 */
	getDefaults() {
		const widgetContainer = this.options.container,
			defaults = widgetContainer.model.config.defaults,
			index = widgetContainer.children.length + 1;

		return {
			_id: '',
			[ defaults.repeater_title_setting ]: extractNestedItemTitle( widgetContainer, index ),
		};
	}

	onChildviewClickDuplicate( childView ) {
		$e.run( 'document/repeater/duplicate', {
			container: this.options.container,
			name: this.model.get( 'name' ),
			index: childView._index,
			renderAfterInsert: false,
		} );

		this.toggleMinRowsClass();
	}

	updateActiveRow() {
		if ( ! this.currentEditableChild ) {
			return;
		}

		$e.run( 'document/repeater/select', {
			container: this.container,
			index: this.currentEditableChild.itemIndex,
			options: { useHistory: false },
		} );
	}
}
