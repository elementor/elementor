import After from 'elementor-api/modules/hooks/ui/after';

export class Draggable extends After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'draggable';
	}

	getConditions( args ) {
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

export default Draggable;
