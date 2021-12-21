import CommandNavigator from 'elementor-regions/navigator/elements/commands/base/command-navigator';

export class ToggleFoldingAll extends CommandNavigator {
	apply( args ) {
		const { state } = args;

		elementor.getPreviewContainer().children.forEachRecursive( ( container ) => {
			$e.run( 'navigator/elements/toggle-folding', {
				container,
				state,
			} );
		} );
	}

	shouldRequireContainer() {
		return false;
	}
}

export default ToggleFoldingAll;
