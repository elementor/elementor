import CommandBase from 'elementor-api/modules/command-base';

export class Close extends CommandBase {
	apply() {
		elementor.changeEditMode( 'preview' );
	}
}

export default Close;
