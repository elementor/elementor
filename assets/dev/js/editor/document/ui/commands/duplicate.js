import CommandHookable from 'elementor-api/modules/command-hookable';

export class Duplicate extends CommandHookable {
	apply() {
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
