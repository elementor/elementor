import CommandNavigator from './command-navigator';

export class CommandNavigatorVisibility extends CommandNavigator {
	/**
	 * Function getVisibility().
	 *
	 * @returns {Boolean}
	 */
	getVisibility() {
		elementorModules.ForceMethodImplementation();
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			const { view, model } = container.navigator;

			model.set( 'hidden', this.getVisibility() );

			view.toggleHiddenClass();
		} );
	}
}

export default CommandNavigatorVisibility;
