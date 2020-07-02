import CommandBase from 'elementor-api/modules/command-base';

export class Open extends CommandBase {
	apply() {
		elementor.changeEditMode( 'edit' );
	}
}

export default Open;

