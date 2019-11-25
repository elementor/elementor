import HookAfter from '../base/after';

export class CustomPosition extends HookAfter {
	command() {
		return 'document/elements/settings';
	}

	id() {
		return 'custom-position';
	}

	conditions( args ) {
		return undefined !== args.settings._position;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			if ( container.view.options.draggable ) {
				container.view.options.draggable.toggle();
			}
		} );
	}
}

export default CustomPosition;
