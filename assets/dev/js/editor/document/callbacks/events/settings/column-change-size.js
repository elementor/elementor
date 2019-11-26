import EventAfter from '../base/after';

export class ColumnChangeSize extends EventAfter {
	command() {
		return 'document/elements/settings';
	}

	id() {
		return 'column-change-size';
	}

	conditions( args ) {
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
