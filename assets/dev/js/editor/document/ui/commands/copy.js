import CommandHookable from 'elementor-api/modules/command-hookable';

export class Copy extends CommandHookable {
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
