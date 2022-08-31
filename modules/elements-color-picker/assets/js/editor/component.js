import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';
import * as uiStates from './ui-states/';

export default class Component extends ComponentBase {
	currentPicker = this.getDefaultPicker();

	/**
	 * Get the default picker object.
	 *
	 * @return {Object} picker
	 */
	getDefaultPicker() {
		return {
			kit: null,
			container: null,
			control: null,
			trigger: null,
			initialColor: null,
		};
	}

	/**
	 * Reset the current picker to its default.
	 *
	 * @return {void}
	 */
	resetPicker() {
		this.currentPicker = this.getDefaultPicker();
	}

	/**
	 * Silently render the UI using a new color value.
	 *
	 * @param {string} value - The new color to set.
	 *
	 * @return {void}
	 */
	renderUI( value ) {
		const { container, control, kit } = this.currentPicker;

		// Silent.
		container.settings.set( control, value );

		const { view } = container;

		// If the container has a View that can be rendered.
		if ( view?.renderUI ) {
			view.renderUI();
		}

		// If it's a kit which uses CSS variables.
		if ( kit ) {
			const { id } = kit.config,
				cssVar = `--e-global-color-${ container.id }`;

			elementor.$previewContents[ 0 ].querySelector( `.elementor-kit-${ id }` ).style.setProperty( cssVar, value );
		}
	}

	/**
	 * Retrieve the Eye-Dropper namespace.
	 *
	 * @return {string} Eye-Dropper namespace
	 */
	getNamespace() {
		return 'elements-color-picker';
	}

	/**
	 * Import the component commands.
	 *
	 * @return {Object} commands
	 */
	defaultCommands() {
		return this.importCommands( commands );
	}

	/**
	 * Import the component UI states.
	 *
	 * @return {Object} UI States
	 */
	defaultUiStates() {
		return this.importUiStates( uiStates );
	}

	/**
	 * Set the commands keyboard shortcuts.
	 *
	 * @return {Object} shortcut
	 */
	defaultShortcuts() {
		return {
			end: {
				keys: 'esc',
				scopes: [ this.getNamespace() ],
			},
		};
	}
}
