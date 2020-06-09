import CommandHistory from 'elementor-document/commands/base/command-history';

export class Delete extends CommandHistory {
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

			// BC: Deprecated since 2.8.0 - use `$e.hooks`.
			elementor.channels.data.trigger( 'element:before:remove', container.model );

			container.model.destroy();

			// BC: Deprecated since 2.8.0 - use `$e.hooks`.
			elementor.channels.data.trigger( 'element:after:remove', container.model );

			this.deleteCache( container );

			container.panel.refresh();
		} );

		if ( 1 === containers.length ) {
			return containers[ 0 ];
		}

		return containers;
	}

	isDataChanged() {
		return true;
	}

	deleteCache( container ) {
		const documentId = container.document.id,
			elementId = container.id,
			component = $e.components.get( 'editor/documents' ),
			command = 'editor/documents/elements';

		$e.data.deleteCache( component, command, {
			documentId,
			elementId,
		} );
	}
}

export default Delete;
