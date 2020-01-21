import Base from '../../commands/base/base';

export class EndTransaction extends Base {
	apply( args ) {
		if ( ! this.component.transactions.length ) {
			return;
		}

		const firstItem = this.component.transactions[ 0 ],
			{ type } = firstItem,
			transactions = this.component.mergeTransactions( this.component.transactions );

		let { title = '', subTitle = '' } = firstItem;

		if ( transactions.length > 1 ) {
			title = elementor.translate( 'elements' );
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

		Object.entries( transactions ).forEach( ( [ id, item ] ) => { // TODO: Use `Object.values`.
			const itemArgs = item;

			// If log already started chain his historyId.
			if ( firstItem.id ) {
				itemArgs.id = firstItem.id;
			}

			$e.run( 'document/history/log-sub-item', itemArgs );
		} );

		$e.run( 'document/history/end-log', { id: historyId } );

		// Clear transactions before leave.
		this.component.transactions = [];
	}
}

export default EndTransaction;
