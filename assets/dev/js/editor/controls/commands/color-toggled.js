import ControlBaseDataView from 'elementor-controls/base-data';
import ControlToggled from './control-toggled';

export class ColorToggled extends ControlToggled {
	/**
	 * Color control was toggled.
	 *
	 * @param {Object}              args
	 * @param {ControlBaseDataView} args.controlView The control view instance.
	 */
	apply( { controlView } ) {
		super.apply( { controlView } );
	}
}

export default ColorToggled;
