import Base from '../base';

export class NestedElementsRemove extends Base {
	getId() {
		return 'nested-elements-remove';
	}

	getCommand() {
		return 'document/repeater/remove';
	}

	apply( args ) {
		// Since `container.children` not refreshed yet.
		setTimeout( () => {
			const { containers = [ args.container ] } = args;

			containers.forEach( ( container ) => {
				$e.run( 'document/elements/delete', {
					container: container.children[ args.index ],
				} );
			} );
		} );
	}
}

export default NestedElementsRemove;
