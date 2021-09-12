import CommandBase from 'elementor-api/modules/command-base';

export class Copy extends CommandBase {
	apply() {
		const selectedElements = elementor.getSelectedElements();

		if ( selectedElements.length ) {
			return $e.run( 'document/elements/copy', {
				containers: selectedElements,
			} );
		}

		return false;
	}
}

export default Copy;
