import ControlBaseDataView from 'elementor-controls/base-data';

/**
 * Toggle a control.
 */
export class ToggleControl extends $e.modules.CommandBase {
	/**
	 * Execute the control-view's toggle.
	 *
	 * @param {Object}              args
	 * @param {string}              args.controlPath The control path.
	 * @param {ControlBaseDataView} args.controlView The control view instance.
	 * @param {boolean}             args.ignore      Ignore command logic (to trigger hooks).
	 *
	 * @return {void}
	 */
	apply( { controlPath, controlView, ignore } ) {
		if ( ignore ) {
			return;
		}

		controlView = controlView || this.getControlView( controlPath );
		controlView.toggle();
	}

	getControlView( path ) {
		const controls = path.split( '/' );
		const editor = elementor.getPanelView().getCurrentPageView();

		let controlView = editor.content.currentView.getControlViewByName( controls[ 0 ] );
		controls.slice( 1 ).forEach( ( control ) => {
			controlView = controlView.getChildControlView?.( control );
		} );

		return controlView;
	}
}

export default ToggleControl;
