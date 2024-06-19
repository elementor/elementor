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

		return 'floating-buttons' === type;
	}

	apply( args ) {
		const { container: { type = '' } } = args;
		switch ( type ) {
			case 'section':
			case 'container':
				$e.run( 'document/elements/select', { container: args.container.children[ 0 ], append: false } );
				break;
			default:
				break;
		}
	}
}

export default AfterSelect;
