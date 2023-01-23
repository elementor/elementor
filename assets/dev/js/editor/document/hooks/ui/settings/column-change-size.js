import After from 'elementor-api/modules/hooks/ui/after';

export class ColumnChangeSize extends After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'column-change-size';
	}

	getConditions( args ) {
		return undefined !== args.settings._inline_size || undefined !== args.settings._column_size;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			container.view.changeSizeUI();
		} );
	}
}

export default ColumnChangeSize;
