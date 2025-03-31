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

			this.deselectRecursive( container.model.get( 'id' ) );

			container.model.destroy();
			container.panel.refresh();
		} );

		if ( 1 === containers.length ) {
			return containers[ 0 ];
		}

		return containers;
	}

	deselectRecursive( id ) {
		const container = elementor.getContainer( id );

		if ( elementor.selection.has( container ) ) {
			$e.run( 'document/elements/deselect', { container } );
		}

		container?.model.get( 'elements' ).forEach( ( childModel ) => {
			this.deselectRecursive( childModel.get( 'id' ) );
		} );
	}
}

export default Delete;
