import Command from 'elementor-api/modules/command';

export class Delete extends Command {
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
