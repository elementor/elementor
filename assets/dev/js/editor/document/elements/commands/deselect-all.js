import CommandBase from 'elementor-api/modules/command-base';

export class DeselectAll extends CommandBase {
	apply() {
		elementor.selection.remove( [], true );
	}
}

export default DeselectAll;
