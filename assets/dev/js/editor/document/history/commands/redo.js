import CommandHookable from 'elementor-api/modules/command-hookable';

export class Redo extends CommandHookable {
	apply() {
		elementor.documents.getCurrent().history.navigate( true );
	}
}

export default Redo;
