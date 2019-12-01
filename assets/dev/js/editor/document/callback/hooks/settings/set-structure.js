import HookAfter from '../base/after';

export class SetStructure extends HookAfter {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'set-structure';
	}

	getConditions( args ) {
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
