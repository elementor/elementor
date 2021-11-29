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
			const view = container.args.navigatorView,
				model = view.model;

			model.set( 'hidden', this.shouldHide() );

			view.toggleHiddenClass();
		} );
	}
}

export default CommandNavigatorShowHide;
