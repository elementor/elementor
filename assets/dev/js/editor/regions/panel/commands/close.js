import CommandHookable from 'elementor-api/modules/command-hookable';

export class Close extends CommandHookable {
	apply() {
		elementor.changeEditMode( 'preview' );
	}
}

export default Close;
