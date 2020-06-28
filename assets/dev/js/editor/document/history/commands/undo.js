import Command from 'elementor-api/modules/command';

export class Undo extends Command {
	apply() {
		elementor.documents.getCurrent().history.navigate();
	}
}

export default Undo;
