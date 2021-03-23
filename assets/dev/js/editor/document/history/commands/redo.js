import Command from 'elementor-api/modules/command';

export class Redo extends Command {
	apply() {
		elementor.documents.getCurrent().history.navigate( true );
	}
}

export default Redo;
