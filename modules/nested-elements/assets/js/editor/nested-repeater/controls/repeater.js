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
		const containerModelCid = this.getRepeaterItemContainerModelCidIfExists( childView );
		const renderAfterInsert = ! containerModelCid;

		$e.run( 'document/repeater/duplicate', {
			container: this.options.container,
			name: this.model.get( 'name' ),
			index: childView._index,
			renderAfterInsert,
			options: {
				containerModelCid,
			},
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

	getRepeaterItemContainerModelCidIfExists( childView ) {
		if ( 'yes' !== childView.model.attributes.item_dropdown_content ) {
			return false;
		}

		const container = this.container.children.filter( ( child ) => parseInt( child.view.el.dataset.content ) === childView._index + 1 );

		if ( ! container.length ) {
			return false;
		}

		return container[ 0 ].model.cid;
	}
}
