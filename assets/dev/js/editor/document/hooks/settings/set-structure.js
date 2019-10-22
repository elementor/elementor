import HookAfter from '../base/after';

export class SetStructure extends HookAfter {
	hook() {
		return 'document/elements/settings';
	}

	id() {
		return 'set-structure';
	}

	conditioning( args ) {
		return !! args.settings.structure;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /**Container*/ container ) => {
			container.view.adjustColumns();
		} );

		return true;
	}
}

export default SetStructure;
