import CommandHookable from 'elementor-api/modules/command-hookable';

export class Undo extends CommandHookable {
	apply() {
		elementor.documents.getCurrent().history.navigate();
	}
}

export default Undo;
