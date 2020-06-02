import CommandHistory from 'elementor-document/commands/base/command-history';

export class Create extends CommandHistory {
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
		} else {
			$e.run( 'document/elements/delete', { container: data.containerToRestore } );
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

		let result = [],
			isIdSetLocal = false;

		// BC: Deprecated since 2.8.0 - use `$e.hooks`.
		if ( ! options.trigger ) {
			options.trigger = {
				beforeAdd: 'element:before:add',
				afterAdd: 'element:after:add',
			};
		}

		containers.forEach( ( container ) => {
			container = container.lookup();

			// Since cache require model id, ensure `model.id`.
			if ( ! model.id ) {
				model.id = elementor.helpers.getUniqueID();

				/**
				 * If id was set locally, its required to be deleted later since its used each loop.
				 */
				isIdSetLocal = true;
			}

			const component = $e.components.get( 'editor/documents' ),
				command = 'editor/documents/elements',
				query = {
					documentId: elementor.documents.getCurrent().id,
					elementId: model.id,
				};

			$e.data.setCache( component, command, query, model );

			const newContainer = container.view.addElement( model, options ).getContainer();

			if ( isIdSetLocal ) {
				delete model.id;
				isIdSetLocal = false;
			}

			result.push( newContainer );
			/**
			 * Acknowledge history of each created item, because we cannot pass the elements when they do not exist
			 * in getHistory().
			 */
			if ( this.isHistoryActive() ) {
				$e.internal( 'document/history/log-sub-item', {
					container,
					type: 'sub-add',
					restore: this.constructor.restore,
					options,
					data: {
						containerToRestore: newContainer,
						modelToRestore: newContainer.model.toJSON(),
					},
				} );
			}
		} );

		if ( 1 === result.length ) {
			result = result[ 0 ];
		}

		return result;
	}

	isDataChanged() {
		return true;
	}
}

export default Create;
