import ComponentBase from 'elementor-api/modules/component-base';
import HistoryPanelComponent from './panel/component';
import HistoryActionsComponent from './panel/actions/component';
import RevisionsComponent from 'elementor/modules/history/assets/js/revisions/component';
import PanelPage from './panel/page';

import * as commands from './commands/';
import * as commandsInternal from './commands/internal/';

export default class Component extends ComponentBase {
	__construct( args ) {
		super.__construct( args );

		/**
		 * Transactions holder.
		 *
		 * @type {Array}
		 */
		this.transactions = [];

		$e.components.register( new HistoryPanelComponent() );
		$e.components.register( new HistoryActionsComponent() );
		$e.components.register( new RevisionsComponent() );

		elementor.on( 'panel:init', () => {
			elementor.getPanelView().addPage( 'historyPage', {
				view: PanelPage,
				title: elementor.translate( 'history' ),
			} );
		} );
	}

	getNamespace() {
		return 'document/history';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultCommandsInternal() {
		return this.importCommands( commandsInternal );
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
