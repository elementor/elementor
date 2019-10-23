export default class Component extends elementorModules.common.Component {
	getNamespace() {
		return 'document/history';
	}

	getCommands() {
		return {
			startLog: ( args ) => {
				const { type, containers = [ args.container ] } = args,
					history = elementor.documents.getCurrent().history;

				if ( history.isItemStarted() ) {
					$e.run( 'document/history/addSubItem', args );

					return null;
				}

				if ( ! type ) {
					throw Error( 'type is required.' );
				}

				if ( ! containers.length ) {
					throw Error( 'container or containers are required.' );
				}

				args = this.normalizeLogArgs( args );

				return history.startItem( args );
			},

			endLog: ( args ) => {
				elementor.documents.getCurrent().history.endItem( args.id );
			},

			deleteLog: ( args ) => {
				elementor.documents.getCurrent().history.deleteItem( args.id );
			},

			addItem: ( itemData ) => {
				$e.run( 'document/history/endLog', {
					id: $e.run( 'document/history/startLog', itemData ),
				} );
			},

			addSubItem: ( args ) => {
				const history = elementor.documents.getCurrent().history;

				if ( ! history.getActive() ) {
					return;
				}

				const id = args.id || history.getCurrentId();

				args = this.normalizeLogArgs( args );

				const items = history.getItems(),
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
				elementor.documents.getCurrent().history.navigate();
			},

			redo: () => {
				elementor.documents.getCurrent().history.navigate( true );
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
