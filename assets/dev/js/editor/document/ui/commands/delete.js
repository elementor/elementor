import { elementsSelection } from 'elementor-document/elements/selectors';

export class Delete extends $e.modules.CommandBase {
	apply() {
		const selectedElements = elementsSelection.getContainers();

		if ( selectedElements.length ) {
			return $e.run( 'document/elements/delete', {
				containers: selectedElements,
			} );
		}

		return false;
	}
}

export default Delete;
