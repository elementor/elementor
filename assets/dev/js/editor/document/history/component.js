
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

				if ( args.containers && 1 === args.containers.length ) {
					args.container = args.containers[ 0 ];
				}

				// TODO: rewrite & optimize.
				if ( args.model ) {
					const model = args.model.attributes || args.model;

					// If model empty.
					if ( 0 === Object.keys( model ).length ) {
						args.title = elementor.translate( 'column' );
						args.elementType = 'column';
					} else {
						args.title = elementor.history.history.getModelLabel( model );
						args.elementType = model.elType;
					}
				} else if ( args.container ) {
					const { container } = args,
						elType = container.model.get( 'elType' );

					if ( ! elType ) {
						args.title = elementor.translate( 'section' );
						args.elementType = 'section';
					} else {
						args.title = elementor.history.history.getModelLabel( container.model );
						args.elementType = elType;
					}
				} else if ( args.containers ) {
					args.title = elementor.translate( 'element' );
				}

				if ( args.containers && args.containers.length > 1 ) {
					args.title = elementor.translate( 'elements' );
				}

				return elementor.history.history.startItem( args );
			},

			endLog: ( args ) => {
				elementor.history.history.endItem( args.id );
			},

			deleteLog: ( args ) => {
				elementor.history.history.deleteItem( args.id );
			},

			addItem: ( itemData ) => {
				itemData = Object.assign( itemData, { returnValue: true } );

				$e.run( 'document/history/endLog', {
					id: $e.run( 'document/history/startLog', itemData ),
				} );
			},

			addSubItem: ( itemData ) => {
				if ( ! elementor.history.history.getActive() ) {
					return;
				}

				const items = elementor.history.history.getItems(),
					item = items.findWhere( { id: elementor.history.history.getCurrentId() } );

				if ( ! item ) {
					throw new Error( 'History item not found.' );
				}

				item.get( 'items' ).unshift( itemData );
			},

			undo: () => {
				elementor.history.history.navigate();
			},

			redo: () => {
				elementor.history.history.navigate( true );
			},
		};
	}

	getShortcuts() {
		return {

		};
	}
}
