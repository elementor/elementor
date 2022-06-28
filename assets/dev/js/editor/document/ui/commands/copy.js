import { elementsSelection } from 'elementor-document/elements/selectors';

export class Copy extends $e.modules.CommandBase {
	apply() {
		const selectedElements = elementsSelection.getContainers();

		if ( selectedElements.length ) {
			return $e.run( 'document/elements/copy', {
				containers: selectedElements,
			} );
		}

		return false;
	}
}

export default Copy;
