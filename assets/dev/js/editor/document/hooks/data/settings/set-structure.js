import After from 'elementor-api/modules/hooks/data/after';

export class SetStructure extends After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'set-structure';
	}

	getContainerType() {
		return 'section';
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
