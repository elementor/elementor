import CommandBase from 'elementor-api/modules/command-base';

export class Undo extends CommandBase {
	apply( args ) {
		elementor.documents.getCurrent().history.navigate();
	}
}

export default Undo;
