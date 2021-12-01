import CommandBase from 'elementor-api/modules/command-base';
// import Panel from '../panel';
export class Open extends CommandBase {
	apply() {
		// const panel = new Panel();
		// panel.open();
		elementor.changeEditMode( 'edit' );
	}
}

export default Open;

