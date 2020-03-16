import CommandHookable from 'elementor-api/modules/command-hookable';

export class Delete extends CommandHookable {
	apply() {
		const selectedElement = elementor.getCurrentElement();

		if ( selectedElement ) {
			return $e.run( 'document/elements/delete', {
				container: selectedElement.getContainer(),
			} );
		}

		return false;
	}
}

export default Delete;
