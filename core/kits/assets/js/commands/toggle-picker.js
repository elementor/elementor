import ControlBaseDataView from 'elementor-controls/base-data';

/**
 * Toggle the relevant global picker in the global side panel.
 */
export class TogglePicker extends $e.modules.CommandBase {
	/**
	 * Execute either the color or font picker's toggle command.
	 *
	 * @param {Object}              args
	 * @param {string}              args.name        The name of the global (colors/typography).
	 * @param {string}              args.type        The type of the color (system/custom).
	 * @param {string}              args.id          The ID of the color picker.
	 * @param {ControlBaseDataView} args.controlView The control view instance.
	 * @param {boolean}             args.ignore      Ignore command logic (to trigger hooks).
	 *
	 * @return {void}
	 */
	apply( { name, type, id, controlView, ignore } ) {
		if ( ignore ) {
			return;
		}

		if ( ! controlView ) {
			const editor = elementor.getPanelView().getCurrentPageView();
			const repeaterView = editor.content.currentView.getControlViewByName( `${ type }_${ name }` );
			const repeaterRowView = repeaterView.getChildControlView( id );
			controlView = repeaterRowView.getChildControlView( 'colors' === name ? 'color' : 'typography_typography' );
		}

		controlView.toggle();
	}
}

export default TogglePicker;
