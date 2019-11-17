export default class Component extends elementorModules.common.Component {
	getNamespace() {
		return 'document/history';
	}

	getCommands() {
		return {
			'start-log': ( args ) => {
				if ( elementor.history.history.isItemStarted() || args.id ) {
					$e.run( 'document/history/add-sub-item', args );

					return null;
				}

				if ( ! args.type ) {
					throw Error( 'type is required.' );
				}

				const { containers = [ args.container ] } = args;

				if ( ! containers.length ) {
					throw Error( 'container or containers are required.' );
				}

				args = this.normalizeLogArgs( args );

				return elementor.history.history.startItem( args );
			},

			'end-log': ( args ) => {
				elementor.history.history.endItem( args.id );
			},

			'delete-log': ( args ) => {
				elementor.history.history.deleteItem( args.id );
			},

			'add-item': ( itemData ) => {
				$e.run( 'document/history/end-log', {
					id: $e.run( 'document/history/start-log', itemData ),
				} );
			},

			'add-sub-item': ( args ) => {
				if ( ! elementor.history.history.getActive() ) {
					return;
				}

				const id = args.id || elementor.history.history.getCurrentId();

				args = this.normalizeLogArgs( args );

				const items = elementor.history.history.getItems(),
					item = items.findWhere( { id } );

				if ( ! item ) {
					throw new Error( 'History item not found.' );
				}

				/**
				 * Sometimes `args.id` passed to `addSubItem`, to add sub item for specific id.
				 * this `id` should not be passed as sub-item.
				 */
				if ( args.id ) {
					delete args.id;
				}

				item.get( 'items' ).unshift( args );
			},

			undo: () => {
				elementor.history.history.navigate();
			},

			redo: () => {
				elementor.history.history.navigate( true );
			},
		};
	}

	normalizeLogArgs( args ) {
		const { containers = [ args.container ] } = args;

		if ( ! args.title ) {
			if ( 1 === containers.length ) {
				args.title = containers[ 0 ].label;
			} else {
				args.title = elementor.translate( 'elements' );
			}
		}

		return args;
	}
}
