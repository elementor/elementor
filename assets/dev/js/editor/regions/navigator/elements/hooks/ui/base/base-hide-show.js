import Base from './base';

export default class BaseHideShow extends Base {
	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => container.model.set( 'hidden', this.shouldHide() ) );
	}

	shouldHide() {
		elementorModules.ForceMethodImplementation();
	}
}
