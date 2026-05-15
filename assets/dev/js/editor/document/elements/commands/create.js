export class Create extends $e.modules.editor.document.CommandHistoryBase {
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' ),
			container = historyItem.get( 'container' ),
			options = historyItem.get( 'options' ) || {};

		// No clone when restoring. e.g: duplicate will generate unique ids while restoring.
		if ( options.clone ) {
			options.clone = false;
		}

		if ( isRedo ) {
			$e.run( 'document/elements/create', {
				container,
				model: data.modelToRestore,
				options,
			} );

			return;
		}

		if ( ! elementor.helpers.isAtomicWidget( data.modelToRestore ) ) {
			$e.run( 'document/elements/delete', { container: data.containerToRestore } );

			return;
		}

		const containerToRestore = data.containerToRestore?.lookup?.() ?? data.containerToRestore;

		if ( containerToRestore instanceof elementorModules.editor.Container ) {
			$e.run( 'document/elements/delete', { container: containerToRestore } );

			return;
		}

		const parentId = data.containerToRestore?.parent?.id;
		const childId = data.containerToRestore?.id ?? data.modelToRestore?.id;

		if ( parentId && childId ) {
			$e.components.get( 'document' ).utils.removeModelFromParent( parentId, childId );
		}
	}

	validateArgs( args ) {
		this.requireContainer( args );

		// Avoid Backbone model & etc.
		this.requireArgumentConstructor( 'model', Object, args );
	}

	getHistory( args ) {
		const { model, containers = [ args.container ] } = args;

		return {
			containers,
			model,
			type: 'add',
			title: elementor.helpers.getModelLabel( model ),
		};
	}

	apply( args ) {
		const { model, options = {}, containers = [ args.container ] } = args;

		let result = [];

		containers.forEach( ( container ) => {
			container = container.lookup();

			if ( ! container?.view || container.view.isDestroyed ) {
				container = $e.components.get( 'document' ).utils.findContainerById( container.id ) ?? container;
			}

			if ( ! container?.view || container.view.isDestroyed ) {
				$e.components.get( 'document' ).utils.addModelToParent( container.id, model, options );
				return;
			}

			const createdContainer = container.view.addElement( model, options ).getContainer();

			result.push( createdContainer );

			/**
			 * Acknowledge history of each created item, because we cannot pass the elements when they do not exist
			 * in getHistory().
			 */
			if ( this.isHistoryActive() && this.history ) {
				$e.internal( 'document/history/log-sub-item', {
					container,
					type: 'sub-add',
					restore: this.constructor.restore,
					options,
					data: {
						containerToRestore: createdContainer,
						modelToRestore: createdContainer.model.toJSON(),
					},
				} );
			}
		} );

		if ( 1 === result.length ) {
			result = result[ 0 ];
		}

		return result;
	}
}

export default Create;
