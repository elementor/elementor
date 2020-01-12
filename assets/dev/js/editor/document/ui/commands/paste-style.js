import CommandBase from 'elementor-api/modules/command-base';

export class PasteStyle extends CommandBase {
	apply( args ) {
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
