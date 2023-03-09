import ControlBaseDataView from 'elementor-controls/base-data';
import ControlToggled from './control-toggled';

export class PopoverToggleToggled extends ControlToggled {
	/**
	 * Popover toggle control was toggled.
	 *
	 * @param {Object}              args
	 * @param {ControlBaseDataView} args.controlView The control view instance.
	 */
	apply( { controlView } ) {
		super.apply( { controlView } );
	}
}

export default PopoverToggleToggled;
