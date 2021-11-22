import Base from '../base';

export class NestedRepeaterCreateContainer extends Base {
	getId() {
		return 'nested-repeater-create-container';
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
		} );
	}
}

export default NestedRepeaterCreateContainer;
