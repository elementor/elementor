export class Copy extends $e.modules.CommandBase {
	apply() {
		const selectedElements = elementor.selection.getElements();

		if ( selectedElements.length ) {
			return $e.run( 'document/elements/copy', {
				containers: selectedElements,
			} );
		}

		return false;
	}
}

export default Copy;
