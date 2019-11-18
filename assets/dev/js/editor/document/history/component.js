export default class Component extends elementorModules.common.Component {
	transactions = [];

	getNamespace() {
		return 'document/history';
	}

	startTransactionItem( args ) {
		if ( ! args.type ) {
			throw Error( 'type is required.' );
		}

		const { containers = [ args.container ] } = args;

		if ( ! containers.length ) {
			throw Error( 'container or containers are required.' );
		}

		const currentId = elementor.history.history.getCurrentId();

		if ( currentId ) {
			// If log already started chain his historyId.
			args.id = currentId;
		}

		args = this.normalizeLogTitle( args );

		this.transactions.push( args );
	}

	addTransactionItem( args ) {
		const { containers = [ args.container ] } = args;

		if ( ! containers.length ) {
			throw Error( 'container or containers are required.' );
		}

		const currentId = elementor.history.history.getCurrentId();

		if ( currentId ) {
			// If log already started chain his historyId.
			args.id = currentId;
		}

		args = this.normalizeLogTitle( args );

		this.transactions.push( args );
	}

	endTransactionItem() {
		if ( ! this.transactions.length ) {
			return;
		}

		const transactions = {},
			firstItem = this.transactions[ 0 ],
			{ type } = firstItem;

		let { title = '', subTitle = '' } = firstItem;

		this.transactions.forEach( ( itemArgs ) => {
			// If no containers at the current transaction.
			if ( ! itemArgs.container && ! itemArgs.containers ) {
				return;
			}

			const { containers = [ itemArgs.container ] } = itemArgs;

			if ( containers ) {
				containers.forEach( ( container ) => {
					if ( ! itemArgs.data ) {
						return;
					}

					if ( transactions[ container.id ] ) {
						// Get transactions which contain for this container.
						const availableTransactions = this.transactions.filter( ( transaction ) => {
							if ( transaction.data && transaction.data.changes[ container.id ] ) {
								return true;
							}
						} ),
							lastTransaction = availableTransactions[ availableTransactions.length - 1 ];

						transactions[ container.id ].data.changes[ container.id ].new =
							lastTransaction.data.changes[ container.id ].new;

						return;
					}

					transactions[ container.id ] = itemArgs;
				} );
			}
		} );

		if ( transactions.length > 1 ) {
			title = 'Elements'; // translate.
			subTitle = '';
		}

		const history = {
			title,
			subTitle,
			type,
		};

		// If firstItem have id already it means that log already started for that transaction.
		if ( firstItem.id ) {
			history.id = firstItem.id;
		}

		if ( ! history.container && ! history.containers ) {
			history.containers = firstItem.containers || [ firstItem.container ];
		}

		const historyId = $e.run( 'document/history/start-log', history );

		Object.entries( transactions ).forEach( ( [ id, item ] ) => { // eslint-disable-line no-unused-vars
			const itemArgs = item;

			// If log already started chain his historyId.
			if ( firstItem.id ) {
				itemArgs.id = firstItem.id;
			}

			$e.run( 'document/history/log-sub-item', itemArgs );
		} );

		$e.run( 'document/history/end-log', { id: historyId } );

		this.transactions = [];
	}

	deleteTransactionItem() {
		const firstItem = this.transactions[ 0 ];

		$e.run( 'document/history/delete-log', firstItem );
	}

	startLog( args ) {
		if ( elementor.history.history.isItemStarted() || args.id ) {
			$e.run( 'document/history/log-sub-item', args );

			return null;
		}

		if ( ! args.type ) {
			throw Error( 'type is required.' );
		}

		const { containers = [ args.container ] } = args;

		if ( ! containers.length ) {
			throw Error( 'container or containers are required.' );
		}

		args = this.normalizeLogTitle( args );

		if ( ! args.title ) {
			throw Error( 'title is required.' );
		}

		return elementor.history.history.startItem( args );
	}

	deleteLog( args ) {
		// TODO: If it uses only args.id then args.id should be passed directly without args object.
		elementor.history.history.deleteItem( args.id );
	}

	endLog( args ) {
		// TODO: If it uses only args.id then args.id should be passed directly without args object.
		if ( args.id ) {
			elementor.history.history.endItem( args.id );
		}
	}

	getCommands() {
		// TODO: Use alphabetical order.
		// TODO: Use this example: `'start-transaction': this.startTransactionItem.bind( this ),`.
		return {
			'start-transaction': ( args ) => this.startTransactionItem( args ),
			'add-transaction': ( args ) => this.addTransactionItem( args ),
			'delete-transaction': () => this.deleteTransactionItem(),
			'end-transaction': () => this.endTransactionItem(),

			'start-log': ( args ) => this.startLog( args ),
			'delete-log': ( args ) => this.deleteLog( args ),
			'end-log': ( args ) => this.endLog( args ),

			'log-item': ( itemData ) => {
				const id = $e.run( 'document/history/start-log', itemData );

				$e.run( 'document/history/end-log', { id } );
			},

			'log-sub-item': ( args ) => {
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
