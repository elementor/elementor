import { extractNestedItemTitle } from 'elementor/modules/nested-elements/assets/js/editor/utils';
import { findChildContainerOrFail } from 'elementor/modules/nested-elements/assets/js/editor/utils';

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
		const containerModelCid = this.getRepeaterItemContainerModelCidIfExists(
			this.container,
			childView._index,
			childView.model.attributes,
			this._parent.model.config.child_container_control_key
		);

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

	getChildViewRemoveConfig( childView ) {
		const config = super.getChildViewRemoveConfig( childView );
		const containerModelCid = this.getRepeaterItemContainerModelCidIfExists(
			this.container,
			childView._index,
			childView.model.attributes,
			this._parent.model.config.child_container_control_key
		);

		config.options = {
			containerModelCid,
		};

		return config;
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

	getRepeaterItemContainerModelCidIfExists( container, index, attribute_path, control_key ) {
		if ( this.itemDoesNotNeedChildContainer( attribute_path, control_key ) ) {
			return false;
		}

		const contentIndex = index + 1;
		const childContainer = container.children.find( ( child ) => +child.view.el.dataset.content === contentIndex );

		if ( ! childContainer ) {
			return false;
		}

		return childContainer.model.cid;
	}

	itemDoesNotNeedChildContainer( attribute_path, control_key ) {
		if ( undefined === control_key ) {
			return true;
		}
		return 'yes' !== attribute_path[ control_key ];
	}

	onSortUpdate( event, ui ) {
		const oldIndex = ui.item.data( 'oldIndex' ),
			newIndex = ui.item.index();

		const containerModelCid = this.getRepeaterItemContainerModelCidIfExists(
			this.options.container,
			oldIndex,
			this.options.container.panel.container.model.attributes.settings.attributes.menu_items?.models[ oldIndex ].attributes,
			this.options.container.args.model.config.child_container_control_key
		);

		const currentContainer = this.options.container;

		$e.run( 'document/repeater/move', {
			container: this.options.container,
			name: this.model.get( 'name' ),
			sourceIndex: oldIndex,
			targetIndex: newIndex,
			options: {
				containerModelCid,
				test: currentContainer
			},
		} );
	}
}
