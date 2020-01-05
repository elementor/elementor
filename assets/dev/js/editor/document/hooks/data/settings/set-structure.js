import DataAfter from 'elementor-api/modules/hooks/data-base/after';

export class SetStructure extends DataAfter {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'set-structure';
	}

	bindContainerType() {
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
