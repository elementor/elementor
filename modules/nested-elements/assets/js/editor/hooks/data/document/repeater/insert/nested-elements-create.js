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
			} );
		} );
	}
}

export default NestedElementsCreate;
