import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
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

	getCommands() {
		return {
			'add-transaction': ( args ) => ( new commands.AddTransaction( args ).run() ),
			'clear-transaction': ( args ) => ( new commands.ClearTransaction( args ).run() ),
			'delete-log': ( args ) => ( new commands.DeleteLog( args ).run() ),
			'end-log': ( args ) => ( new commands.EndLog( args ).run() ),
			'end-transaction': ( args ) => ( new commands.EndTransaction( args ).run() ),
			'log-sub-item': ( args ) => ( new commands.LogSubItem( args ).run() ),
			'start-log': ( args ) => ( new commands.StartLog( args ).run() ),
			'undo-all': ( args ) => args.document.history.doItem( args.document.history.getItems().length - 1 ),
			undo: () => elementor.documents.getCurrent().history.navigate(),
			redo: () => elementor.documents.getCurrent().history.navigate( true ),
		};
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

	isTransactionStarted() {
		return Boolean( this.transactions.length );
	}
}
