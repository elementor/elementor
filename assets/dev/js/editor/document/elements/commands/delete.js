import { removeElementFromDocumentState } from 'elementor-document/elements/utils';

export class Delete extends $e.modules.editor.document.CommandHistoryBase {
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

			$e.store.dispatch(
				this.component.store.actions.delete( {
					documentId: elementor.documents.getCurrentId(),
					elementId: container.id,
					parentId: container.parent.id,
				} ),
			);

			if ( this.isHistoryActive() ) {
				$e.internal( 'document/history/log-sub-item', {
					container,
					type: 'sub-remove',
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
		} );

		if ( 1 === containers.length ) {
			return containers[ 0 ];
		}

		return containers;
	}

	static reducer( state, { payload } ) {
		const { elementId, parentId, documentId } = payload;

		if ( state[ documentId ] ) {
			removeElementFromDocumentState( elementId, parentId, state[ documentId ] );
		}
	}
}

export default Delete;
