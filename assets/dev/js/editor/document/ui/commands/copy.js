import CommandBase from 'elementor-api/modules/command-base';

export class Copy extends CommandBase {
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
