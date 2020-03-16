import CommandHookable from 'elementor-api/modules/command-hookable';

export class PasteStyle extends CommandHookable {
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
