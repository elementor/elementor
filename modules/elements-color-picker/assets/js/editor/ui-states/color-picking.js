import UiStateBase from 'elementor-api/core/states/ui-state-base';

export const COLOR_PICKING_ON = 'on';

/**
 * UI state to determine if the Editor is in Color Picking mode.
 */
export class ColorPicking extends UiStateBase {
	getId() {
		return 'color-picking';
	}

	getScopes() {
		return [
			elementor.$previewContents[ 0 ].body,
		];
	}

	getOptions() {
		return {
			[ COLOR_PICKING_ON ]: '',
		};
	}

	/**
	 * Listen to UI state changes and execute the color picker side effects.
	 *
	 * @param {string} oldValue
	 * @param {string} newValue
	 *
	 * @return {void}
	 */
	onChange( oldValue, newValue ) {
		const editAreaClass = 'elementor-edit-area-active';

		if ( COLOR_PICKING_ON === newValue ) {
			// Prevent elements from triggering edit mode on click.
			elementor.changeEditMode( 'picker' );

			this.toggleScopesClass( editAreaClass, true );
			return;
		}

		this.toggleScopesClass( editAreaClass, false );

		// Return to edit mode.
		elementor.changeEditMode( 'edit' );
	}

	/**
	 * Toggle CSS class to the scopes.
	 *
	 * @param {string} className - CSS class to toggle.
	 * @param {boolean} state - The class state (on/off).
	 *
	 * @return {void}
	 */
	toggleScopesClass( className, state ) {
		this.getScopes().forEach( ( scope ) => {
			scope.classList.toggle( className, state );
		} );
	}
}
