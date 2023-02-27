/**
 * Toggle the relevant global picker in the side panel.
 */
export default class ToggleGlobalPicker extends $e.modules.CommandBase {
	/**
	 * Validate the command arguments.
	 *
	 * @param {Object} args
	 */
	validateArgs( args ) {
		this.requireArgumentType( 'name', 'string', args );
		this.requireArgumentType( 'type', 'string', args );
		this.requireArgumentType( 'id', 'string', args );
	}

	/**
	 * Execute the color picker toggle command.
	 *
	 * @param {string} name The name of the global (colors/typography).
	 * @param {string} type The type of the color (system/custom).
	 * @param {string} id   The ID of the color picker.
	 *
	 * @return {void}
	 */
	apply( { name, type, id } ) {
		const controlViewElement = elementor.getPanelView().getCurrentPageView().content.currentView.getControlViewByName( `${ type }_${ name }` ).$el;

		const idInput = controlViewElement.find( `input[type="hidden"][data-setting="_id"][value="${ id }"]` );
		const repeaterRowControls = idInput.closest( '.elementor-repeater-row-controls' );

		const toggle = repeaterRowControls.find( 'div.pickr button.pcr-button, input.elementor-control-popover-toggle-toggle' );
		toggle.trigger( 'click' );
	}
}
