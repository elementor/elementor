
export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'document/history';
	}

	// dependency( args ) {
	// 	return ! ! args.element;
	// }

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

				if ( args.elements && 1 === args.elements.length ) {
					args.element = args.elements[ 0 ];
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
				} else if ( args.element ) {
					const { element } = args,
						elType = element.model.get( 'elType' );

					if ( ! elType ) {
						args.title = elementor.translate( 'section' );
						args.elementType = 'section';
					} else {
						args.title = elementor.history.history.getModelLabel( element.model );
						args.elementType = elType;
					}
				} else if ( args.elements ) {
					args.title = elementor.translate( 'element' );
				}

				if ( args.elements && args.elements.length > 1 ) {
					args.title = elementor.translate( 'elements' );
				}

				return elementor.history.history.startItem( args );
			},

			endLog: ( args ) => {
				elementor.history.history.endItem( args.id );
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
				$e.run( 'panel/history/actions/undo' ); // TODO: swap between the commands.
			},

			redo: () => {
				$e.run( 'panel/history/actions/redo' ); // TODO: swap between the commands.
			},
		};
	}

	getShortcuts() {
		return {

		};
	}
}
