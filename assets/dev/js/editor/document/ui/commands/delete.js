import CommandBase from 'elementor-api/modules/command-base';

export class Delete extends CommandBase {
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
