export class PasteStyle extends $e.modules.CommandBase {
	apply() {
		const selectedElement = elementor.getCurrentElement();

		if ( selectedElement ) {
			return $e.run( 'document/elements/paste-style', {
				container: selectedElement.getContainer(),
			} );
		}

		return false;
	}
}

export default PasteStyle;
