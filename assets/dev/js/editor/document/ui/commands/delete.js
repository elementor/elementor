import CommandBase from 'elementor-api/modules/command-base';

export class Delete extends CommandBase {
	apply() {
		const selectedElements = elementor.getSelectedElements();

		if ( selectedElements.length ) {
			return $e.run( 'document/elements/delete', {
				containers: selectedElements,
			} );
		}

		return false;
	}
}

export default Delete;
