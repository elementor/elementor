import CommandBase from 'elementor-api/modules/command-base';

export class Redo extends CommandBase {
	apply() {
		elementor.documents.getCurrent().history.navigate( true );
	}
}

export default Redo;
