import Command from 'elementor-api/modules/command';

export class Open extends Command {
	apply() {
		elementor.changeEditMode( 'edit' );
	}
}

export default Open;

