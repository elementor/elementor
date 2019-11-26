import EventAfter from '../base/after';

export class Resizeable extends EventAfter {
	command() {
		return 'document/elements/settings';
	}

	id() {
		return 'resizeable';
	}

	conditions( args ) {
		return undefined !== args.settings._position || undefined !== args.settings._element_width;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			if ( container.view.options.resizeable ) {
				container.view.options.resizeable.toggle();
			}
		} );
	}
}

export default Resizeable;
