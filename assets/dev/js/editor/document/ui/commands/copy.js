import Command from 'elementor-api/modules/command';

export class Copy extends Command {
	apply() {
		const selectedElement = elementor.getCurrentElement();

		if ( selectedElement ) {
			return $e.run( 'document/elements/copy', {
				container: selectedElement.getContainer(),
			} );
		}

		return false;
	}
}

export default Copy;
