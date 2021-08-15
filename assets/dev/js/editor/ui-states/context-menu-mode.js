import UiStateBase from 'elementor-api/core/states/ui-state-base';

export class ContextMenuMode extends UiStateBase {
	static MODE_ON = 'on';

	getId() {
		return 'context-menu-mode';
	}

	getOptions() {
		return {
			[ this.constructor.MODE_ON ]: '',
		};
	}

	onChange( oldValue, newValue ) {
		this.toggleElementsSort( this.constructor.MODE_ON !== newValue );
	}

	toggleElementsSort( isActive ) {
		elementor.getPreviewContainer().forEachChildrenRecursive( ( child ) => {
			child.view.triggerMethod( 'toggleSortMode', isActive );
		} );
	}
}

export default ContextMenuMode;

