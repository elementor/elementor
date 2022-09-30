import After from 'elementor-api/modules/hooks/ui/after';

export class Resizeable extends After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'resizeable';
	}

	getConditions( args ) {
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
