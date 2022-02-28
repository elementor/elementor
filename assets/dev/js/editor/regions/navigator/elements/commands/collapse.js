import CommandNavigator from './base/command-navigator';

export class Collapse extends CommandNavigator {
	apply( args ) {
		const { containers = [ args.container ] } = args;

		if ( ! containers.filter( ( container ) => container ).length ) {
			containers[ 0 ] = elementor.selection.getElements()[ 0 ];
		}

		containers.forEach( ( container ) => {
			if ( ! this.isFoldingAllowed( container ) ) {
				return;
			}

			$e.store.dispatch(
				$e.store.get( 'navigator/folding' ).actions.toggle( {
					elementId: container.id,
					state: false,
				} )
			);
		} );
	}

	shouldRequireContainer() {
		return false;
	}
}

export default Collapse;
