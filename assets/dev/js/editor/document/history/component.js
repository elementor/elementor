export default class Component extends elementorModules.common.Component {
	transaction = [];

	getNamespace() {
		return 'document/history';
	}

	addTransactionItem( args ) {
		if ( ! args.type ) {
			throw Error( 'type is required.' );
		}

		const { containers = [ args.container ] } = args;

		if ( ! containers.length ) {
			throw Error( 'container or containers are required.' );
		}

		args = this.normalizeLogTitle( args );

		this.transaction.push( args );
	}

	getCommands() {
		return {
			'add-log': ( args ) => this.addTransactionItem( args ),
			'start-log': ( args ) => this.addTransactionItem( args ),

			'end-log': () => {
				if ( ! this.transaction.length ) {
					return;
				}

				const containersIndex = {},
					firstItem = this.transaction[ 0 ];

				let { title = '', subTitle = '', type } = firstItem;

				this.transaction.forEach( ( itemArgs ) => {
					if ( ! itemArgs.container && ! itemArgs.containers ) {
						return;
					}

					const { containers = [ itemArgs.container ] } = itemArgs;

					if ( containers ) {
						containers.forEach( ( container ) => {
							containersIndex[ container.id ] = true; // TODO merge changes.
						} );
					}
				} );

				if ( containersIndex.length > 1 ) {
					title = 'Elements'; // translate.
					subTitle = '';
				}

				elementor.history.history.startItem( {
					title,
					subTitle,
					type,
				} );

				this.transaction.forEach( ( itemArgs ) => {
					elementor.history.history.addItem( itemArgs );
				} );

				elementor.history.history.endItem();

				this.transaction = [];
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

				args = this.normalizeLogTitle( args );

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

	normalizeLogTitle( args ) {
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
