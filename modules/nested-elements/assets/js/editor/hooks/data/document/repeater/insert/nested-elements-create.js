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
			const newContainer = $e.run( 'document/elements/create', {
				container,
				model: {
					elType: 'container',
				},
				options: {
					edit: false, // Not losing focus.
				},
			} );

			// Select new created nested container
			newContainer.view.once( 'ready', () => {
				$e.run( 'nested-elements/select', {
					index: newContainer.parent.children.indexOf( newContainer ) + 1,
					container: container,
				} );
			} );
		} );
	}
}

export default NestedElementsCreate;
