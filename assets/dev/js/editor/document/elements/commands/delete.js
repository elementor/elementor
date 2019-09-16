import Base from '../../commands/base';

// Delete.
export default class extends Base {
	static restore( historyItem, isRedo ) {
		const container = historyItem.get( 'container' ),
			data = historyItem.get( 'data' );

		if ( isRedo ) {
			$e.run( 'document/elements/delete', { container } );
		} else {
			$e.run( 'document/elements/create', {
				container: data.parent,
				model: data.model,
				options: {
					at: data.at,
				},
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
					type: 'sub-remove',
					elementType: container.model.get( 'elType' ),
					restore: this.constructor.restore,
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
