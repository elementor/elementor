import Base from './base';

/**
 * Responsible for hiding and showing the actual element.
 */
export default class BaseHideShow extends Base {
	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container.model.set( 'hidden', this.shouldHide() );

			container.view.toggleVisibilityClass();
		} );
	}

	shouldHide() {
		elementorModules.ForceMethodImplementation();
	}
}
