export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'document/history';
	}

	getCommands() {
		return {
			startLog: ( args ) => {
				if ( elementor.history.history.isItemStarted() ) {
					$e.run( 'document/history/addSubItem', args );

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

			endLog: ( args ) => {
				elementor.history.history.endItem( args.id );
			},

			deleteLog: ( args ) => {
				elementor.history.history.deleteItem( args.id );
			},

			addItem: ( itemData ) => {
				$e.run( 'document/history/endLog', {
					id: $e.run( 'document/history/startLog', itemData ),
				} );
			},

			addSubItem: ( args ) => {
				if ( ! elementor.history.history.getActive() ) {
					return;
				}

				const id = args.id || elementor.history.history.getCurrentId();

				args = this.normalizeLogArgs( args )

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

		if ( ! args.elementType ) {
			if ( 1 === containers.length ) {
				args.elementType = containers[ 0 ].model.get( 'elType' );
			} else {
				// Most common element in array.
				args.elementType = _.chain( containers.map( ( item ) => item.model.get( 'elType' ) ) )
					.countBy()
					.pairs()
					.max( _.last )
					.head()
					.value();
			}
		}

		return args;
	}
}
