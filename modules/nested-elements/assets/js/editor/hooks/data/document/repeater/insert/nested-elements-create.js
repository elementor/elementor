import Base from '../base';

export class NestedElementsCreate extends Base {
	getId() {
		return 'nested-elements-create';
	}

	getCommand() {
		return 'document/repeater/insert';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			$e.run( 'document/elements/create', {
				container,
				model: {
					elType: 'container',
				},
				options: {
					edit: false, // Not losing focus.
				},
			} );

			// Select new created nested container
			$e.run( 'nested-elements/select', {
				index: container.repeaters[ args.name ].children.length,
				container: container,
			} );
		} );
	}
}

export default NestedElementsCreate;
