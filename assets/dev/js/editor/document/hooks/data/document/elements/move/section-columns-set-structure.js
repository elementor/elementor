import After from 'elementor-api/modules/hooks/data/after';

export class SectionColumnsSetStructure extends After {
	getCommand() {
		return 'document/elements/move';
	}

	getId() {
		return 'section-columns-set-structure';
	}

	getContainerType() {
		return 'column';
	}

	getConditions( args ) {
		const { containers = [ args.container ], target } = args;

		// Fire the hook only when target is not equals to moved container parent.
		return containers.some( ( /* Container */ container ) => container.parent !== target );
	}

	apply( args ) {
		const { containers = [ args.container ], target } = args;

		containers.forEach( ( /* Container */ container ) => container.parent.view.resetLayout() );

		target.view.resetLayout();

		return true;
	}
}

export default SectionColumnsSetStructure;
