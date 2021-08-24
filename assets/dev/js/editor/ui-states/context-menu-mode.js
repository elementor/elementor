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
		// This proccess can be heavy in large document, the timeout makes sure that this proccess will be last in the stack.
		// ref: https://www.youtube.com/watch?v=8aGhZQkoFbQ
		setTimeout( () => {
			elementor.getPreviewContainer().forEachChildrenRecursive( ( child ) => {
				child.view.triggerMethod( 'toggleSortMode', isActive );
			} );
		}, 0 );
	}
}

export default ContextMenuMode;

