import After from 'elementor-api/modules/hooks/data/after';

export class ActivateSection extends After {
	getCommand() {
		return 'document/elements/select';
	}

	getId() {
		return 'activate-section';
	}

	getConditions( args ) {
		return args.options.section;
	}

	apply( args ) {
		const { options: { section } } = args;

		elementor.activateElementSection( section );
	}
}

export default ActivateSection;
