import Command from 'elementor-api/modules/command';

export class PasteStyle extends Command {
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
