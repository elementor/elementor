import After from 'elementor-api/modules/hooks/ui/after';

export class AfterSelect extends After {
	getCommand() {
		return 'document/elements/select';
	}

	getId() {
		return 'prevent-container-selection';
	}

	getConditions( args ) {
		let type = args?.container?.document?.config?.type;
		if ( ! type ) {
			type = args?.containers[ 0 ]?.document?.config?.type;
		}

		return 'contact-buttons' === type;
	}

	apply( args ) {
		const { container: { type = '' } } = args;
		switch ( type ) {
			case 'section':
			case 'container':
				$e.run( 'document/elements/deselect', args );
				break;
			default:
				break;
		}
	}
}

export default AfterSelect;
