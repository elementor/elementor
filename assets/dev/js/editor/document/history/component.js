import ArgsObject from '../../../modules/imports/args-object.js';

export default class Component extends elementorModules.common.Component {
	__construct( args ) {
		super.__construct( args );

		/**
		 * Transactions holder.
		 *
		 * @type {Array}
		 */
		this.transactions = [];
	}

	getNamespace() {
		return 'document/history';
	}

	normalizeLogTitle( args ) {
		const { containers = [ args.container ] } = args;

		if ( ! args.title && containers[ 0 ] ) {
			if ( 1 === containers.length ) {
				args.title = containers[ 0 ].label;
			} else {
				args.title = elementor.translate( 'elements' );
			}
		}

		return args;
	}

	getEfficientTransactions( transactions ) {
		const result = {};

		transactions.forEach( ( itemArgs ) => {
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

					// Replace new changes by current itemArgs.
					if ( result[ container.id ] ) {
						result[ container.id ].data.changes[ container.id ].new =
							itemArgs.data.changes[ container.id ].new;

						return;
					}

					result[ container.id ] = itemArgs;
				} );
			}
		} );

		return result;
	}

	startTransaction( args ) {
		const argsObject = new ArgsObject( args );

		argsObject.requireArgumentType( 'type', 'string' );

		this.addTransaction( args );
	}

	addTransaction( args ) {
		const currentId = elementor.history.history.getCurrentId();

		if ( currentId ) {
			// If log already started chain his historyId.
			args.id = currentId;
		}

		args = this.normalizeLogTitle( args );

		this.transactions.push( args );
	}

	endTransaction() {
		if ( ! this.transactions.length ) {
			return;
		}

		const firstItem = this.transactions[ 0 ],
			{ type } = firstItem,
			transactions = this.getEfficientTransactions( this.transactions );

		let { title = '', subTitle = '' } = firstItem;

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

		// TODO: Check if next lines are required.
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

		// Clear transactions before leave.
		this.transactions = [];
	}

	deleteTransaction() {
		this.transactions = [];
	}

	startLog( args ) {
		if ( elementor.history.history.isItemStarted() || args.id ) {
			$e.run( 'document/history/log-sub-item', args );

			return null;
		}

		const argsObject = new ArgsObject( args );

		argsObject.requireArgumentType( 'type', 'string' );

		args = this.normalizeLogTitle( args );

		argsObject.requireArgumentType( 'title', 'string' );

		return elementor.history.history.startItem( args );
	}

	deleteLog( args ) {
		if ( args.id ) {
			elementor.history.history.deleteItem( args.id );
		}
	}

	endLog( args ) {
		if ( args.id ) {
			elementor.history.history.endItem( args.id );
		}
	}

	logItem( args ) {
		const id = $e.run( 'document/history/start-log', args );

		$e.run( 'document/history/end-log', { id } );
	}

	logSubItem( args ) {
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
	}

	getCommands() {
		return {
			'add-transaction': this.addTransaction.bind( this ),
			'delete-log': this.deleteLog.bind( this ),
			'delete-transaction': this.deleteTransaction.bind( this ),
			'end-log': this.endLog.bind( this ),
			'end-transaction': this.endTransaction.bind( this ),
			'log-item': this.logItem.bind( this ),
			'log-sub-item': this.logSubItem.bind( this ),
			'start-log': this.startLog.bind( this ),
			'start-transaction': this.startTransaction.bind( this ),

			undo: () => elementor.history.history.navigate(),
			redo: () => elementor.history.history.navigate( true ),
		};
	}
}
