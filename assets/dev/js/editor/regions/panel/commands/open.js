import CommandHookable from 'elementor-api/modules/command-hookable';

export class Open extends CommandHookable {
	apply() {
		elementor.changeEditMode( 'edit' );
	}
}

export default Open;

