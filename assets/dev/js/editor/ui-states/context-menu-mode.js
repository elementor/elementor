import UiStateBase from 'elementor-api/core/states/ui-state-base';

export class ContextMenuMode extends UiStateBase {
	getId() {
		return 'context-menu-mode';
	}

	getOptions() {
		return {
			on: '',
		};
	}

	onChange( oldValue, newValue ) {
		this.toogleElementsSort( newValue );
	}

	toogleElementsSort( value ) {
		elementor.getPreviewContainer().forEachChildrenRecursive( ( child ) => {
			child.view.triggerMethod( 'toggleSortMode', 'on' !== value );
		} );
	}
}

