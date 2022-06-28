import { elementsSelection } from 'elementor-document/elements/selectors';

export class Duplicate extends $e.modules.CommandBase {
	apply() {
		const selectedElements = elementsSelection.getContainers();

		if ( selectedElements.length ) {
			return $e.run( 'document/elements/duplicate', {
				containers: selectedElements,
			} );
		}

		return false;
	}
}

export default Duplicate;
