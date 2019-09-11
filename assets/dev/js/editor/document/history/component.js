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

				if ( ! args.title ) {
					if ( 1 === containers.length ) {
						args.title = containers[ 0 ].label;
					} else {
						args.title = elementor.translate( 'elements' );
					}
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
