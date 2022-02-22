import CommandNavigator from './command-navigator';

/**
 * Responsible for showing/hiding navigator element.
 */
export class CommandNavigatorShowHide extends CommandNavigator {
	/**
	 * Function shouldHide().
	 *
	 * @returns {Boolean}
	 */
	shouldHide() {
		elementorModules.ForceMethodImplementation();
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container.model.set( 'hidden', this.shouldHide() );

			$e.store.dispatch(
				$e.store.get( 'document/elements' ).actions.change( {
					containerId: container.id,
					changes: {
						hidden: container.model.get( 'hidden' ),
					},
				} )
			);
		} );
	}
}

export default CommandNavigatorShowHide;
