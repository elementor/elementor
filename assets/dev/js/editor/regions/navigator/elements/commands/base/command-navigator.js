import CommandBase from 'elementor-api/modules/command-base';

export class CommandNavigator extends CommandBase {
	validateArgs( args ) {
		// Not all navigator commands require container to work, eg: 'navigator/elements/toggle-folding-all'.
		if ( this.shouldRequireContainer() ) {
			this.requireContainer( args );
		}
	}

	shouldRequireContainer() {
		return true;
	}

	/**
	 * Folding currently allowed for elements which has children by default and which are not the root.
	 *
	 * @param container
	 * @returns {boolean|*|boolean}
	 */
	isFoldingAllowed( container ) {
		return container.hasChildrenByDefault && 'document' !== container.id;
	}
}

export default CommandNavigator;
