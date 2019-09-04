import Base from './base';

// Delete.
export default class extends Base {
	static restore( historyItem, isRedo ) {
		const containers = historyItem.get( 'containers' );

		if ( isRedo ) {
			containers.forEach( ( container ) => {
				$e.run( 'document/elements/delete', { container } );
			} );
		} else {
			const subItems = historyItem.collection;

			containers.forEach( ( container ) => {
				const data = subItems.findWhere( { container } ).get( 'data' );

				$e.run( 'document/elements/create', {
					container: data.parent,
					model: data.model,
					options: {
						at: data.at,
					},
				} );
			} );
		}
	}

	validateArgs( args ) {
		this.requireContainer( args );
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args;

		return {
			containers,
			type: 'remove',
			history: {
				behavior: {
					restore: this.constructor.restore,
				},
			},
		};
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			const parent = container.parent;

			if ( this.isHistoryActive() ) {
				$e.run( 'document/history/addSubItem', {
					container,
					data: {
						model: container.model.toJSON(),
						parent: container.parent,
						at: container.view._index,
					},
				} );
			}

			container.model.destroy();

			container.panel.refresh();

			if ( parent && parent.model && 'section' === parent.model.get( 'elType' ) ) {
				if ( 0 === parent.view.collection.length && this.isHistoryActive() ) {
					parent.view.handleEmptySection();
				} else if ( parent.view.collection.length ) {
					parent.view.resetLayout();
				}
			}
		} );
	}
}
