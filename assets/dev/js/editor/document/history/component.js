import * as Commands from './commands/';

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

	mergeTransactions( transactions ) {
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

	getCommands() {
		return {
			'add-transaction': ( args ) => ( new Commands.AddTransaction( args ).run() ),
			'delete-log': ( args ) => ( new Commands.DeleteLog( args ).run() ),
			'delete-transaction': ( args ) => ( new Commands.DeleteTransaction( args ).run() ),
			'end-log': ( args ) => ( new Commands.EndLog( args ).run() ),
			'end-transaction': ( args ) => ( new Commands.EndTransaction( args ).run() ),
			'log-sub-item': ( args ) => ( new Commands.LogSubItem( args ).run() ),
			'start-log': ( args ) => ( new Commands.StartLog( args ).run() ),
			'start-transaction': ( args ) => ( new Commands.StartTransaction( args ).run() ),

			undo: () => elementor.history.history.navigate(),
			redo: () => elementor.history.history.navigate( true ),
		};
	}
}
