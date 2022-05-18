import CommandBase from 'elementor-api/modules/command-base';

export class Duplicate extends CommandBase {
	apply() {
		const selectedElements = elementor.selection.getElements();

		if ( selectedElements.length ) {
			return $e.run( 'document/elements/duplicate', {
				containers: selectedElements,
			} );
		}

		return false;
	}
}

export default Duplicate;
