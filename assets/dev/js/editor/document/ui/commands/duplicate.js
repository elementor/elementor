import CommandBase from 'elementor-api/modules/command-base';

export class Duplicate extends CommandBase {
	apply( args ) {
		const selectedElement = elementor.getCurrentElement();

		if ( selectedElement ) {
			return $e.run( 'document/elements/duplicate', {
				container: selectedElement.getContainer(),
			} );
		}

		return false;
	}
}

export default Duplicate;
