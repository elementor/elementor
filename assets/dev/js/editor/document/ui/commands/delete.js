export class Delete extends $e.modules.CommandBase {
	apply() {
		const selectedElements = elementor.selection.getElements();

		if ( selectedElements.length ) {
			return $e.run( 'document/elements/delete', {
				containers: selectedElements,
			} );
		}

		return false;
	}
}

export default Delete;
