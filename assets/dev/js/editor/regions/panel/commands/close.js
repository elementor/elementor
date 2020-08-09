import Command from 'elementor-api/modules/command';

export class Close extends Command {
	apply() {
		elementor.changeEditMode( 'preview' );
	}
}

export default Close;
